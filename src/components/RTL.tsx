import {createMuiTheme, ThemeProvider} from "@material-ui/core";
import {jssPreset, StylesProvider} from "@material-ui/core/styles";
import React from "react";
import {create} from "jss";
import rtl from "jss-rtl";

const jss = create({plugins: [...jssPreset().plugins, rtl()]});
const theme = createMuiTheme({
    direction: "rtl"
})

export default function RTL(props: any) {
    return (
        <ThemeProvider theme={theme}>
            <StylesProvider jss={jss}>
                {props.children}
            </StylesProvider>
        </ThemeProvider>
    );
}
