import {GetServerSideProps} from "next";
import {getSession, useSession} from "next-auth/client";
import {getCurrUserRequest, getUpdateRequest} from "../../utils/requests";
import {format} from "date-fns";
import {cleanForJSON, dateOnly} from "../../utils/utils";
import Link from "next/link";
import MoreMenu from "../../components/MoreMenu";
import React, {useState} from "react";
import EditUpdate from "../../components/EditUpdate";
import axios from "axios";
import {useRouter} from "next/router";
import Showdown from "showdown";
import Parser from "html-react-parser";
import FollowButton from "../../components/FollowButton";
import {NextSeo} from "next-seo";

export default function UpdatePage(props: { data: any, updateUrl: string, userData: any }) {
    const router = useRouter();
    const [session, loading] = useSession();
    const [data, setData] = useState<any>(props.data);
    const [userData, setUserData] = useState<any>(props.userData);

    const isOwner = !loading && session && (data.email === session.user.email);
    const thisUpdate = data.updates.find(d => d.url === encodeURIComponent(props.updateUrl));

    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [body, setBody] = useState<string>(thisUpdate.body);
    const [title, setTitle] = useState<string>(thisUpdate.title);
    const [date, setDate] = useState<string>(format(dateOnly(thisUpdate.date), "yyyy-MM-dd"));
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);

    function onEdit() {
        setIsLoading(true);

        axios.post("/api/edit-update", {
            id: thisUpdate._id,
            username: data.urlName,
            date: date,
            body: body,
            title: title,
        }).then(res => {
            setIsLoading(false);
            setIsEdit(false);
            if (res.data.urlChanged) {
                router.push(`/@${data.urlName}/${res.data.data.updates.find(d => d._id === thisUpdate._id).url}`);
            }
            else setData(res.data.data);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        });
    }

    function onCancelEdit() {
        setBody(thisUpdate.body);
        setTitle(thisUpdate.title);
        setDate(format(dateOnly(thisUpdate.date), "yyyy-MM-dd"));
        setIsEdit(false);
    }

    function handleDelete() {
        axios.post("/api/delete-update", {
            id: thisUpdate._id,
            userId: data._id,
        }).then(() => {
            router.push("/@" + data.urlName);
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        })
    }

    const markdownConverter = new Showdown.Converter({
        strikethrough: true,
        tasklists: true,
        tables: true,
    });

    return (
        <div className="max-w-7xl relative mx-auto">
            <NextSeo
                title={`${format(dateOnly(thisUpdate.date), "MM/d/yy")} | ${data.name}'s daily updates on Updately`}
                description={`${data.name}'s ${format(dateOnly(thisUpdate.date), "EEEE, MMMM d")} update${thisUpdate.title ? `: ${thisUpdate.title}` : ""} on Updately`}
            />
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex h-16 my-8 items-center sticky top-0 bg-white z-30">
                    <Link href={`/@${data.urlName}`}>
                        <a href="" className="flex items-center">
                            <img src={data.image} alt={`Profile picture of ${data.name}`} className="w-10 h-10 rounded-full mr-4"/>
                            <div>
                                <div className="up-ui-title"><span>{data.name}</span></div>
                            </div>
                        </a>
                    </Link>
                    <div className="ml-auto">
                        {isOwner ? (
                            <Link href="/new-update"><a className="up-button primary small">Post new update</a></Link>
                        ) : (
                            <FollowButton data={data} setData={setData} userData={userData} setUserData={setUserData}/>
                        )}
                    </div>
                </div>
                {isEdit ? (
                    <EditUpdate
                        body={body}
                        setBody={setBody}
                        title={title}
                        setTitle={setTitle}
                        date={date}
                        setDate={setDate}
                        isLoading={isLoading}
                        onSave={onEdit}
                        onCancel={onCancelEdit}
                        confirmText="Save changes"
                    />
                ) : (
                    <>
                        <div className="flex">
                            <div className="mr-4">
                                <h1 className="up-h1 mb-4">{format(dateOnly(thisUpdate.date), "EEEE, MMMM d")}</h1>
                                <h2 className="up-h2">{thisUpdate.title}</h2>
                                <div className="mt-8 md:flex opacity-50">
                                    <p className="md:mr-12"><b>Created:</b> {format(new Date(thisUpdate.createdAt), "MMMM d 'at' h:mm a")}</p>
                                    <p><b>Last edit:</b> {format(new Date(thisUpdate.updatedAt), "MMMM d 'at' h:mm a")}</p>
                                </div>
                            </div>
                            {isOwner && (
                                <div className="ml-auto">
                                    <MoreMenu
                                        items={[
                                            {label: "Edit", onClick: () => setIsEdit(true)},
                                            {label: "Delete", onClick: handleDelete}
                                        ]}
                                    />
                                </div>
                            )}
                        </div>
                        <hr className="my-8"/>
                        <div className="prose content my-8">
                            {Parser(markdownConverter.makeHtml(thisUpdate.body))}
                        </div>
                    </>
                )}
            </div>
            <div className="xl:absolute xl:left-4 xl:top-8 xl:h-full max-w-3xl mx-auto px-4 xl:mx-0 xl:px-0">
                <hr className="my-8 xl:hidden"/>
                <div className="xl:sticky xl:top-24">
                    {data.updates.sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((update) => (
                        <div
                            className={`mb-8 leading-snug ${update._id === thisUpdate._id ? "" : "opacity-50 hover:opacity-100 transition"}`}
                            key={update._id}
                        >
                            <Link href={`/@${data.urlName}/${update.url}`} shallow={false}>
                                <a>
                                    <div className="font-bold"><span>{format(dateOnly(update.date), "MMMM d, yyyy")}</span></div>
                                    <div><span>{update.title.substr(0,24)}{update.title.length > 24 ? "..." : ""}</span></div>
                                </a>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (Array.isArray(context.params.username) || Array.isArray(context.params.updateUrl) || context.params.username.substr(0, 1) !== "@") return { notFound: true };
    const username: string = context.params.username.substr(1);
    const updateUrl: string = context.params.updateUrl;
    const data = await getUpdateRequest(username, updateUrl);
    const session = await getSession(context);
    const userData = session ? await getCurrUserRequest(session.user.email) : null;

    if (!data) return { notFound: true };

    if (data.private) {
        if (!session || data.followers.findIndex(d => d === session.user.email)) {
            let resData = data.slice(0);
            delete resData.updates;
            delete resData.followers;
            delete resData.following;
            resData.privateView = true;
            return { props: { data: resData, updateUrl: updateUrl }};
        }
    }

    return { props: { data: cleanForJSON(data), updateUrl: updateUrl, userData: cleanForJSON(userData), key: updateUrl }};
};