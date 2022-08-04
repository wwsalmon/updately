import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'


class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);
        return initialProps;
    }

    render() {
        return (
            <Html>
                <Head>
                    <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400;1,500;1,700&display=swap" rel="stylesheet"/>
                </Head>
                <body>
                <Main />
                <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument;