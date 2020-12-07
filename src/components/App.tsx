import {AppBar, Box, IconButton, Toolbar, Typography} from "@material-ui/core";
import {Language} from "@material-ui/icons";
import RTL from "./RTL";
import React, {useState} from "react";
import BarcodeScanner from "./BarcodeScanner";
import {FormattedMessage, IntlProvider} from "react-intl";

const messagesInArabic = {
    title: "باركود سكانر",
    camera: "كاميرا",
    barcode: "باركود"
}

const storedLocale = localStorage.getItem("preferredLocale");
const browserLocale = (navigator?.languages[0] ?? navigator.language).toString().startsWith("ar") ? "ar" : "en";
const initialLocale = storedLocale ?? browserLocale;

export default function App() {
    const [locale, setLocale] = useState(initialLocale);

    const Content = () => <>
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6">
                    <FormattedMessage id="title"
                                      defaultMessage="Barcode Scanner"
                    />
                </Typography>
                <Box m="auto"/>
                <IconButton color="inherit"
                            size="small"
                            onClick={() => {
                                if (locale === "ar") {
                                    localStorage.setItem("preferredLocale", "en");
                                    setLocale("en");
                                } else {
                                    localStorage.setItem("preferredLocale", "ar");
                                    setLocale("ar");
                                }
                            }}
                >
                    <Typography variant="body1">
                        {locale === "ar" ? "English" : "عربي"}
                    </Typography>
                    <Language color="inherit"/>
                </IconButton>
            </Toolbar>
        </AppBar>
        <BarcodeScanner/>
    </>

    if (locale === "ar") {
        return (
            <IntlProvider locale={"ar"} messages={messagesInArabic} defaultLocale="en">
                <Box dir="rtl">
                    <RTL>
                        <Content/>
                    </RTL>
                </Box>
            </IntlProvider>
        )
    } else {
        return (
            <IntlProvider locale={"en"} defaultLocale="en">
                <Box>
                    <Content/>
                </Box>
            </IntlProvider>
        )
    }
}
