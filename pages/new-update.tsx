import {format} from "date-fns";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/react";
import {getCurrUserRequest} from "../utils/requests";
import {updateModel} from "../models/models";
import {ssrRedirect} from "next-response-helpers";
import mongoose from "mongoose";

export default function NewUpdate() {
    return <></>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) return ssrRedirect("/sign-in");

    const userData = await getCurrUserRequest(session.user.email);

    const newDraft = await updateModel.create({
        userId: new mongoose.Types.ObjectId(userData._id),
        date: format(new Date(), "yyyy-MM-dd"),
        body: userData.template || "",
        title: "",
        published: false,
    });

    return ssrRedirect("/drafts/" + newDraft._id);
};