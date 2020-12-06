import React from "react";
import {AppBar, Box, TextField, Typography} from "@material-ui/core";

export default function App() {
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
                    <TextField variant="outlined" fullWidth/>
                </Box>
            </Box>
        </Box>
    );
}
