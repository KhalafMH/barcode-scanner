import React, {useEffect, useRef, useState} from "react";
import {Box, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import {BrowserMultiFormatReader} from "@zxing/library";
import _ from "lodash";
import {FormattedMessage, useIntl} from "react-intl";

export default function BarcodeScanner() {
    const [barcode, setBarcode] = useState("");
    const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string | null>(null);
    const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
    const videoDevicesRef = useRef<Array<MediaDeviceInfo>>([]);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);

    const intl = useIntl();

    useEffect(() => {
        barcodeReaderRef.current = new BrowserMultiFormatReader();
        barcodeReaderRef.current.listVideoInputDevices()
            .then(videoDevices => {
                if (videoDevices.length < 1) {
                    alert("No camera detected")
                    return
                }
                videoDevicesRef.current = videoDevices;
                setSelectedVideoDeviceId(videoDevices[videoDevices.length - 1].deviceId)
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
        if (selectedVideoDeviceId) {
            barcodeReaderRef.current?.decodeFromVideoDevice(
                selectedVideoDeviceId,
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
    }, [selectedVideoDeviceId, barcode])

    return (
        <Box
            display="grid"
            gridGap={10}
            justifyContent="center"
            p={2}
        >
            <Box>
                {(videoDevicesRef.current?.length ?? 0) > 0 && selectedVideoDeviceId && <>
                    <InputLabel id="cameraInputLabel">
                        <FormattedMessage
                            id="camera"
                            defaultMessage="Camera"
                        />
                    </InputLabel>
                    <Select
                        variant="outlined" fullWidth
                        labelId="cameraInputLabel"
                        value={selectedVideoDeviceId}
                        onChange={e => setSelectedVideoDeviceId(e.target.value as string)}
                    >
                        {videoDevicesRef.current?.map(device =>
                            <MenuItem value={device.deviceId} key={device.deviceId}>{device.label}</MenuItem>
                        )}
                    </Select>
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
            <Box>
                <TextField
                    variant="outlined" fullWidth
                    label={intl.formatMessage({id: "barcode", defaultMessage: "Barcode"})}
                    value={barcode}
                    disabled={true}
                />
            </Box>
        </Box>
    );
}
