import React, {useEffect, useState} from "react";
import {AppBar, Box, TextField, Typography} from "@material-ui/core";
import {BrowserMultiFormatReader} from "@zxing/library";
import _ from "lodash";


export default function App() {
    const [barcode, setBarcode] = useState("");

    useEffect(() => {
        const barcodeReader = new BrowserMultiFormatReader();
        barcodeReader.listVideoInputDevices()
            .then(videoDevices => {
                if (videoDevices.length < 1) {
                    alert("No camera detected")
                    return
                }
                barcodeReader.decodeFromVideoDevice(
                    videoDevices[videoDevices.length - 1].deviceId,
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
                );
            })
            .catch(reason => {
                console.log(`error: ${reason}`);
                alert(`error: ${reason}`);
            });
        return function clean() {
            barcodeReader.reset()
        }
    })

    return (
        <Box height="100vh">
            <AppBar position="static">
                <Box
                    m={1}
                >
                    <Typography variant="h5">
                        Barcode Scanner
                    </Typography>
                </Box>
            </AppBar>
            <Box
                display="grid"
                gridTemplateRows="1fr 1fr"
                gridGap={10}
                justifyContent="center"
                alignContent="center"
                height="100%"
                p={2}
            >
                <Box
                    width="80vmin"
                    height="80vmin"
                    border="2px solid black"
                    borderRadius={5}
                >
                    <video id="scannerVideo" width="100%" height="100%"/>
                </Box>
                <Box>
                    <Typography variant="body1">Barcode</Typography>
                    <TextField variant="outlined" fullWidth value={barcode} disabled={true}/>
                </Box>
            </Box>
        </Box>
    );
}
