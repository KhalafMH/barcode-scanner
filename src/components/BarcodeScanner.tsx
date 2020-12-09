import React, {useEffect, useState} from "react";
import {Box, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import {BrowserMultiFormatReader} from "@zxing/library";
import _ from "lodash";
import {FormattedMessage, useIntl} from "react-intl";

export default function BarcodeScanner() {
    const [barcode, setBarcode] = useState("");
    const [barcodeReader, setBarcodeReader] = useState<BrowserMultiFormatReader | null>(null);
    const [videoDevices, setVideoDevices] = useState<Array<MediaDeviceInfo>>([]);
    const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string | null>(null);

    const intl = useIntl();

    useEffect(() => {
        const barcodeReader = new BrowserMultiFormatReader();
        setBarcodeReader(barcodeReader);
        barcodeReader.listVideoInputDevices()
            .then(videoDevices => {
                if (videoDevices.length < 1) {
                    alert("No camera detected")
                    return
                }
                setVideoDevices(videoDevices);
                setSelectedVideoDeviceId(videoDevices[videoDevices.length - 1].deviceId)
            })
            .catch(reason => {
                console.log(`error: ${reason}`);
                alert(`error: ${reason}`);
            });
        return function clean() {
            barcodeReader.reset()
        }
    }, [])

    useEffect(() => {
        if (selectedVideoDeviceId) {
            barcodeReader?.decodeFromVideoDevice(
                selectedVideoDeviceId,
                "scannerVideo",
                result => {
                    const isBarcodeNew = result
                        && !_.isEmpty(result.getText().trim())
                        && result.getText() !== barcode;
                    if (isBarcodeNew) {
                        new Audio("assets/barcode-scanner.mp3").play()
                            .then(() => {
                                setBarcode(result.getText());
                            });
                    }
                }
            )
            return () => {
                barcodeReader?.stopContinuousDecode();
            }
        }
    }, [selectedVideoDeviceId, barcode, barcodeReader])

    return (
        <Box
            display="grid"
            gridTemplateRows="auto auto auto"
            gridGap={10}
            justifyContent="center"
            p={2}
        >
            <Box>
                {(videoDevices?.length ?? 0) > 0 && selectedVideoDeviceId && <>
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
                        {videoDevices?.map(device =>
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
                <video id="scannerVideo" width="100%" height="100%"/>
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
