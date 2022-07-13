import React, {useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";
import {NextSeo} from "next-seo";
import EditUpdate from "../../components/EditUpdate"
import { Update } from "../../utils/types";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/react";
import { updateModel } from "../../models/models";
import { getCurrUserRequest } from "../../utils/requests";
import { cleanForJSON } from "../../utils/utils";
import { format } from "date-fns";

const Draft = ({update}: {update: Update}) => {
    const router = useRouter();

    const [body, setBody] = useState<string>(update.body);
    const [title, setTitle] = useState<string>("");
    const [date, setDate] = useState<string>(format(new Date(update.date), "yyyy-MM-dd"));
    const [postLoading, setPostLoading] = useState<boolean>(false);

    function handlePost() {
        setPostLoading(true);

        axios.post("/api/update", {
            requestType: "publish",
            date: date,
            body: body,
            title: title,
            id: update._id,
        }).then(res => {
            router.push(res.data.url);
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

export default Draft

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (Array.isArray(context.params.draftId) || !session) return { notFound: true };
    const thisUser = await getCurrUserRequest(session.user.email);

    const thisUpdate = await updateModel.findById(context.params.draftId);
    if (!thisUpdate || thisUpdate.published || !thisUpdate.userId.equals(thisUser._id)) return { notFound: true };

    return { props: { update: cleanForJSON(thisUpdate) } };
};