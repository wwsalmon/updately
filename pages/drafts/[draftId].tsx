import React, {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";
import {NextSeo} from "next-seo";
import EditUpdate from "../../components/EditUpdate"
import { Update } from "../../utils/types";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/react";
import { updateModel } from "../../models/models";
import { getCurrUserRequest } from "../../utils/requests";
import {cleanForJSON, dateOnly} from "../../utils/utils";
import { format } from "date-fns";
import { useInterval } from "../../utils/hooks";

const Draft = ({update}: {update: Update}) => {
    const router = useRouter();

    const [body, setBody] = useState<string>(update.body);
    const [title, setTitle] = useState<string>(update.title);
    const [date, setDate] = useState<string>(update.createdAt == update.updatedAt ? format(new Date(), "yyyy-MM-dd") : format(dateOnly(update.date), "yyyy-MM-dd"));
    const [postLoading, setPostLoading] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(true);

    useEffect(() => {
        const x = document.getElementsByClassName("autosave")
        if (x && x.length > 0) x[x.length - 1].innerHTML = isSaved ? "Saved" : "Saving..."
    }, [isSaved])



    const handleSave = useCallback(({date, body, title}) => {
        setIsSaved(false);

        axios.post("/api/update", {
            requestType: "saveDraft",
            date: date,
            body: body,
            title: title,
            id: update._id,
        }).then(res => {
            setIsSaved(true);
        }).catch(e => {
            console.log(e);
        })
    }, [])

    const handlePublish = () => {
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

    const handleDelete = () => {
        axios.delete("/api/update", {
            data: {
                id: update._id,
            }
        }).then(res => {
            router.push("/");
        }).catch(e => {
            console.log(e);
        })
    }

    useInterval(() => handleSave({date, body, title}), isSaved ? null : 1000);

    // run this effect on update only (not on initial mount)
    const isInitialMount = useRef(true);
    useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
    } else {
        setIsSaved(false);
    }
    }, [body, title, date]);

    return (
        <div className="max-w-4xl mx-auto px-4">
            <NextSeo
                title="Post new update | Updately"
                description="Post a new update to share with your followers."
            />

            <h1 className="up-h1 mb-4">New update</h1>
            <p>This draft is automatically saved. You can access your drafts by going to your profile.</p>

            <EditUpdate
                body={body}
                setBody={setBody}
                title={title}
                setTitle={setTitle}
                date={date}
                setDate={setDate}
                isLoading={postLoading}
                onSave={handlePublish}
                onCancel={handleDelete}
                confirmText="Publish update"
                cancelText="Delete draft"
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