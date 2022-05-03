import "../styles/globals.css";
import {SessionProvider} from 'next-auth/react';
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import NProgress from "nprogress";
import "../styles/nprogress.css";
import Router from "next/router";
import { ThemeProvider } from "next-themes";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function App({Component, pageProps}) {
    return (
        // @ts-ignore
        <ThemeProvider attribute="class" defaultTheme="light">
            <SessionProvider session={pageProps.session}>
                <Navbar/>
                <Component {...pageProps} />
                <Footer/>
            </SessionProvider>
        </ThemeProvider>
    )
}