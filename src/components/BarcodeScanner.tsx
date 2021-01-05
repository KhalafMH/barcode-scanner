import React, {useEffect, useRef, useState} from "react";
import {Box, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import {BrowserMultiFormatReader} from "@zxing/library";
import _ from "lodash";
import {FormattedMessage, useIntl} from "react-intl";
import {int} from "@zxing/library/es2015/customTypings";
import {FileCopy, OpenInNew} from "@material-ui/icons";

export default function BarcodeScanner() {
    const [barcode, setBarcode] = useState("");
    const [selectedVideoDeviceIndex, setSelectedVideoDeviceIndex] = useState<int | null>(null);
    const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
    const videoDevicesRef = useRef<Array<MediaDeviceInfo>>([]);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const barcodeFieldRef = useRef<HTMLInputElement>();

    const intl = useIntl();

    let barcodeIsURL = false;
    try {
        new URL(barcode)
        barcodeIsURL = true
    } catch {
        // pass
    }

    useEffect(() => {
        barcodeReaderRef.current = new BrowserMultiFormatReader();
        barcodeReaderRef.current.listVideoInputDevices()
            .then(videoDevices => {
                if (videoDevices.length < 1) {
                    alert("No camera detected")
                    return
                }
                videoDevicesRef.current = videoDevices;
                setSelectedVideoDeviceIndex(videoDevices.length - 1)
            })
            .catch(reason => {
                console.log(`error: ${reason}`);
                alert(`error: ${reason}`);
            });
        return function clean() {
            barcodeReaderRef.current?.reset()
        }
    }, [])

    useEffect(() => {
        if (selectedVideoDeviceIndex != null) {
            barcodeReaderRef.current?.decodeFromVideoDevice(
                videoDevicesRef.current[selectedVideoDeviceIndex].deviceId,
                videoElementRef.current,
                result => {
                    const isBarcodeNew = result
                        && !_.isEmpty(result.getText().trim())
                        && result.getText() !== barcode;
                    if (isBarcodeNew) {
                        new Audio("assets/sounds/barcode-scanner.mp3").play()
                            .then(() => {
                                setBarcode(result.getText());
                            });
                    }
                }
            )
            return () => {
                barcodeReaderRef.current?.reset();
            }
        }
    }, [selectedVideoDeviceIndex, barcode])

    return (
        <Box
            display="grid"
            justifyItems="center"
            gridTemplateColumns="1fr"
        >
            <Box
                display="grid"
                gridGap={10}
                justifyItems="center"
                gridTemplateColumns="1fr"
                maxWidth="80vmin"
                p={2}
            >
                <Box width="100%">
                    {(videoDevicesRef.current?.length ?? 0) > 0 && (selectedVideoDeviceIndex != null) && <>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel>
                                <FormattedMessage
                                    id="camera"
                                    defaultMessage="Camera"
                                />
                            </InputLabel>
                            <Select
                                label={intl.formatMessage({id: "camera", defaultMessage: "Camera"})}
                                value={selectedVideoDeviceIndex}
                                onChange={e => setSelectedVideoDeviceIndex(e.target.value as int)}
                            >
                                {videoDevicesRef.current?.map((device, index) =>
                                    <MenuItem value={index} key={device.deviceId}>{device.label}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </>
                    }
                </Box>
                <Box
                    width="80vmin"
                    height="80vmin"
                    border="2px solid black"
                    borderRadius={5}
                >
                    <video ref={videoElementRef} width="100%" height="100%"/>
                </Box>
                <Box width="100%">
                    <TextField
                        inputRef={barcodeFieldRef}
                        variant="outlined"
                        fullWidth
                        label={intl.formatMessage({id: "barcode", defaultMessage: "Barcode"})}
                        value={barcode}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">
                                <IconButton
                                    disabled={_.isEmpty(barcode)}
                                    onClick={() => {
                                        console.log("hello")
                                        console.log(barcodeFieldRef.current)
                                        barcodeFieldRef.current?.select();
                                        barcodeFieldRef.current?.setSelectionRange(0, 99999);
                                        document.execCommand("copy", false, "Hi");
                                    }}
                                >
                                    <FileCopy/>
                                </IconButton>
                                <IconButton
                                    disabled={!barcodeIsURL}
                                    onClick={() => window.open(barcode, "_blank")}
                                >
                                    <OpenInNew/>
                                </IconButton>
                            </InputAdornment>
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}
