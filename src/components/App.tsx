import {
    AppBar,
    Box,
    Button,
    createMuiTheme,
    IconButton,
    Snackbar,
    ThemeProvider,
    Toolbar,
    Typography
} from "@material-ui/core";
import {Close, Language} from "@material-ui/icons";
import RTL from "./RTL";
import React, {useEffect, useState} from "react";
import BarcodeScanner from "./BarcodeScanner";
import {FormattedMessage, IntlProvider, useIntl} from "react-intl";
import * as serviceWorkerRegistrationUtils from "../serviceWorkerRegistration";

const messagesInArabic = {
    title: "باركود سكانر",
    camera: "كاميرا",
    barcode: "باركود",
    serviceWorkerUpdateNotification: "يوجد إصدار أحدث",
    update: "تحديث",
}
const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#5a5a5a"
        }
    }
})

const storedLocale = localStorage.getItem("preferredLocale");
const browserLocale = (navigator?.languages[0] ?? navigator.language).toString().startsWith("ar") ? "ar" : "en";
const initialLocale = storedLocale ?? browserLocale;

export default function App() {
    const [locale, setLocale] = useState(initialLocale);
    const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [serviceWorkerUpdateNotificationOpen, setServiceWorkerUpdateNotificationOpen] = useState(false);

    useEffect(() => {
        // Register service worker
        console.log(`registering service worker`);
        serviceWorkerRegistrationUtils.register({
            onUpdate: registration => {
                setServiceWorkerRegistration(registration)
                setServiceWorkerUpdateNotificationOpen(true);
            },
            onSuccess: registration => setServiceWorkerRegistration(registration)
        });
    }, [])

    function updateServiceWorker() {
        serviceWorkerRegistration?.waiting?.postMessage({type: "SKIP_WAITING"});
        setServiceWorkerUpdateNotificationOpen(false)
        window.location.reload();
    }

    function Content() {
        const intl = useIntl();

        function handleCloseNotification(reason: string | null) {
            if (reason === "clickaway") {
                return
            }
            setServiceWorkerUpdateNotificationOpen(false);
        }

        const ThisAppBar = () => (
            <AppBar position="static">
                <Toolbar>
                    <Box width={32} mx={1}>
                        <img src="logo192.png" alt="logo" width="100%" height="100%"/>
                    </Box>
                    <Typography variant="h6">
                        <FormattedMessage
                            id="title"
                            defaultMessage="Barcode Scanner"
                        />
                    </Typography>
                    <Box m="auto"/>
                    <Button
                        color="inherit"
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
                        <Language color="inherit" fontSize="small"/>
                    </Button>
                </Toolbar>
            </AppBar>
        );

        const ThisSnackBar = () => (
            <Snackbar
                open={serviceWorkerUpdateNotificationOpen}
                onClose={(event, reason) => handleCloseNotification(reason)}
                message={intl.formatMessage({
                    id: "serviceWorkerUpdateNotification", defaultMessage: "Newer version available"
                })}
                action={
                    <>
                        <Button
                            color="secondary"
                            size="small"
                            onClick={() => updateServiceWorker()}
                        >
                            <FormattedMessage
                                id="update"
                                defaultMessage="Update"
                            />
                        </Button>
                        <IconButton
                            color="inherit"
                            size="small"
                            onClick={() => handleCloseNotification(null)}
                        >
                            <Close/>
                        </IconButton>
                    </>
                }
            />
        );

        return <>
            <ThisAppBar/>
            <BarcodeScanner/>
            <ThisSnackBar/>
        </>;
    }

    if (locale === "ar") {
        return (
            <IntlProvider locale={"ar"} messages={messagesInArabic} defaultLocale="en">
                <ThemeProvider theme={theme}>
                    <Box dir="rtl">
                        <RTL>
                            <Content/>
                        </RTL>
                    </Box>
                </ThemeProvider>
            </IntlProvider>
        )
    } else {
        return (
            <IntlProvider locale={"en"} defaultLocale="en">
                <ThemeProvider theme={theme}>
                    <Box>
                        <Content/>
                    </Box>
                </ThemeProvider>
            </IntlProvider>
        )
    }
}