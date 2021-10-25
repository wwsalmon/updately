import React, {useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";
import {NextSeo} from "next-seo";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/client";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import {User} from "../utils/types";
import Link from "next/link";
import {getCurrUserRequest} from "../utils/requests";
import {cleanForJSON} from "../utils/utils";
import {FiCheckCircle} from "react-icons/fi";

export default function EditTemplate(props: {userData: User}) {
    const router = useRouter();
    const [userData, setUserData] = useState<User>(props.userData);
    const [template, setTemplate] = useState<string>(userData.template || "");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    function onSave() {
        setIsLoading(true);
        setIsSuccess(false);

        axios.post("/api/edit-template", {
            id: userData._id,
            template: template
        }).then(res => {
            setIsLoading(false);
            setIsSuccess(true);
            setUserData(res.data.userData);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        })
    }

    return (
        <div className="max-w-4xl mx-auto px-4">
            <NextSeo
                title="Edit update template | Updately"
                description="Edit the template for new updates."
            />

            <h1 className="up-h1 mb-4">Edit update template</h1>
            <p className="opacity-50">
                The template you save will be loaded as the initial text for new updates.
            </p>

            <hr className="my-8"/>

            <div className="my-8">
                <div className="prose content max-w-full">
                    <SimpleMDE
                        id="helloworld"
                        onChange={setTemplate}
                        value={template}
                        options={{
                            placeholder: "Write your update here...",
                            toolbar: ["bold", "italic", "strikethrough", "|", "heading-1", "heading-2", "heading-3", "|", "link", "quote", "unordered-list", "ordered-list", "|", "guide"]
                        }}
                    />
                </div>
            </div>

            <hr className="my-8"/>

            <div className="my-8 flex -mx-2">
                <div className="relative">
                    <button className="up-button primary mx-2" disabled={template === (userData.template || "") || isLoading} onClick={onSave}>
                        <span className={isLoading ? "invisible" : ""}>Save</span>
                    </button>
                    {isLoading && (
                        <div className="up-spinner"/>
                    )}
                </div>
                <Link href={`/@${userData.urlName}`}>
                    <a className={`up-button text mx-2 ${isLoading ? "disabled" : ""}`}>Cancel</a>
                </Link>
            </div>

            {isSuccess && (
                <div className="flex items-center">
                    <FiCheckCircle/>
                    <p className="ml-2">Changes saved!</p>
                </div>
            )}

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

    const userData = await getCurrUserRequest(session.user.email);

    return {props: {userData: cleanForJSON(userData)}};
};