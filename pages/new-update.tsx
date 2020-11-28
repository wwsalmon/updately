import React, {useState} from "react";
import {format} from "date-fns";
import axios from "axios";
import {useRouter} from "next/router";
import EditUpdate from "../components/EditUpdate";
import {NextSeo} from "next-seo";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/client";

export default function NewUpdate() {
    const router = useRouter();

    const [body, setBody] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [postLoading, setPostLoading] = useState<boolean>(false);

    function handlePost() {
        setPostLoading(true);

        axios.post("/api/new-update", {
            date: date,
            body: body,
            title: title,
        }).then(res => {
            console.log(res);
            router.push("/");
        }).catch(e => {
            console.log(e);
            setPostLoading(false);
        })
    }

    return (
        <div className="max-w-4xl mx-auto px-4">
            <NextSeo
                title="Post new update | Updately"
                description="Post a new update to share with your followers."
            />

            <h1 className="up-h1">New update</h1>

            <EditUpdate
                body={body}
                setBody={setBody}
                title={title}
                setTitle={setTitle}
                date={date}
                setDate={setDate}
                isLoading={postLoading}
                onSave={handlePost}
                onCancel={() => router.push("/")}
                confirmText="Post update"
            />

        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        context.res.setHeader("location", "/sign-in");
        context.res.statusCode = 302;
        context.res.end();
        return {props: {}};
    }

    return {props: {}};
};