import '../styles/globals.css';
import {Provider} from 'next-auth/client';
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import NProgress from "nprogress";
import "../styles/nprogress.css";
import Router from "next/router";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function App({Component, pageProps}) {
    return (
        <Provider session={pageProps.session}>
            <Navbar/>
            <Component {...pageProps} />
            <Footer/>
        </Provider>
    )
}