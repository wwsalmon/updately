import {GetServerSideProps} from "next";
import {getSession, signIn} from "next-auth/react";
import {FaGoogle} from "react-icons/fa";
import React from "react";
import {NextSeo} from "next-seo";

export default function SignIn() {
    return (
        <div className="max-w-sm px-4 mx-auto">
            <NextSeo
                title="Sign in to Updately"
                description="Updately is a social platform for daily updates. Share updates with friends for social accountability and goal-setting"
            />
            <h1 className="up-h1">Sign in</h1>
            <div className="content my-4">
                <p>Sign in to post updates and follow other users.</p>
            </div>
            <button
                className="up-button primary"
                onClick={() => signIn('google')}
            >
                <div className="flex items-center">
                    <FaGoogle/><span className="ml-2">Sign in</span>
                </div>
            </button>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (session) {
        context.res.setHeader("location", "/");
        context.res.statusCode = 302;
        context.res.end();
        return {props: {}};
    }

    return {props: {}};
};