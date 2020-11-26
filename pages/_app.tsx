import '../styles/globals.css';
import {Provider} from 'next-auth/client';
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function App({Component, pageProps}) {
    return (
        <Provider session={pageProps.session}>
            <Navbar/>
            <Component {...pageProps} />
            <Footer/>
        </Provider>
    )
}