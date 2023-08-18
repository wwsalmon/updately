import {GetServerSideProps} from "next";
import {getSession} from "next-auth/react";
import {GetUpdateRequestResponse, getCurrUserRequest, getUpdateRequest} from "../../utils/requests";
import {format} from "date-fns";
import {cleanForJSON, dateOnly, fetcher} from "../../utils/utils";
import Link from "next/link";
import MoreMenu from "../../components/MoreMenu";
import React, {useState} from "react";
import EditUpdate from "../../components/EditUpdate";
import axios from "axios";
import {useRouter} from "next/router";
import showdown from "showdown";
import showdownHtmlEscape from "showdown-htmlescape";
import Parser from "html-react-parser";
import ProfileFollowButton from "../../components/ProfileFollowButton";
import {NextSeo} from "next-seo";
import {LikeItem, Update, User} from "../../utils/types";
import UpdateComments from "../../components/UpdateComments";
import useSWR, {responseInterface} from "swr";
import {FiHeart} from "react-icons/fi";
import {notificationModel} from "../../models/models";
import {getMentionsAndBodySegments} from "../../components/UpdateCommentItem";
import { DeleteModal } from "../../components/Modal";
import { ssrRedirect } from "next-response-helpers";

export default function UpdatePage(props: { data: GetUpdateRequestResponse, updateUrl: string, userData: User }) {
    const router = useRouter();
    const [data, setData] = useState<GetUpdateRequestResponse>(props.data);
    const [userData, setUserData] = useState<any>(props.userData);

    const isOwner = userData && (data.user.email === userData.email);
    const thisUpdate = data.update;

    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [body, setBody] = useState<string>(thisUpdate.body);
    const [title, setTitle] = useState<string>(thisUpdate.title);
    const [date, setDate] = useState<string>(format(dateOnly(thisUpdate.date), "yyyy-MM-dd"));
    const [tags, setTags] = useState<string[]>(thisUpdate.tags || []);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [likesIter, setLikesIter] = useState<number>(0);

    const {data: updatesObj} = useSWR(`/api/get-curr-user-updates?page=${1}&urlName=${data.user.urlName}`, fetcher);
    const updates = (updatesObj && updatesObj.length) ? updatesObj[0].paginatedResults : [];
    const numUpdates = (updatesObj && updatesObj.length) ? updatesObj[0].totalCount[0].estimatedDocumentCount : 0;
    const {data: likesData, error: likesError}: responseInterface<{ likes: LikeItem[] }, any> = useSWR(`/api/like?updateId=${thisUpdate._id}&iter=${likesIter}`, fetcher);

    const isLike = likesData && likesData.likes && userData && !!likesData.likes.find(d => d.userId === userData._id);

    function onEdit() {
        setIsLoading(true);

        axios.post("/api/update", {
            requestType: "savePublished",
            id: thisUpdate._id,
            date: date,
            body: body,
            tags: tags,
            title: title,
        }).then(res => {
            setIsLoading(false);
            setIsEdit(false);
            if (res.data.urlChanged) {
                router.push(`/@${data.user.urlName}/${res.data.urlChanged}`);
            }
            else {
                let newData = {...data};
                newData.update.date = date;
                newData.update.body = body;
                newData.update.title = title;
                newData.update.tags = tags;
                setData(newData);
            }
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

    function onPressLike() {
        if (!userData) return router.push("/sign-in");

        if (!(likesData && likesData.likes)) return;

        const isLike = !!likesData.likes.find(d => d.userId === userData._id);

        if (isLike) {
            axios
                .delete("/api/like", {data: {updateId: thisUpdate._id}})
                .then(() => setLikesIter(likesIter + 1));
        } else {
            axios
                .post("/api/like", {updateId: thisUpdate._id})
                .then(() => setLikesIter(likesIter + 1));
        }
    }

    const markdownConverter = new showdown.Converter({
        strikethrough: true,
        tasklists: true,
        tables: true,
        extensions: [showdownHtmlEscape],
    });

    const {bodySegments, mentionObjs} = getMentionsAndBodySegments(body);

    const bodyToParse = (mentionObjs && mentionObjs.length) ?
        bodySegments.map((segment, i) => {
            let retval = segment;
            if (i !== bodySegments.length - 1) retval += `@[${mentionObjs[i].display}](/@${thisUpdate.mentionedUsersArr.find(d => d._id.toString() === mentionObjs[i].id).urlName})`;
            return retval;
        }).join("")
        : body;

    return (
        <div className="max-w-7xl relative mx-auto">
            <DeleteModal isOpen={isDelete} setIsOpen={setIsDelete} thisUpdate={thisUpdate} userUrlName={data.user.urlName} />
            <NextSeo
                title={`${format(dateOnly(thisUpdate.date), "M/d/yy")} | ${data.user.name}'s daily updates on Updately`}
                description={`${data.user.name}'s ${format(dateOnly(thisUpdate.date), "EEEE, MMMM d")} update${thisUpdate.title ? `: ${thisUpdate.title}` : ""} on Updately`}
            />
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex h-16 my-8 items-center sticky top-0 sm:top-16 bg-white z-20 dark:bg-gray-900">
                    <Link href={`/@${data.user.urlName}`}>
                        <a href="" className="flex items-center">
                            <img src={data.user.image} alt={`Profile picture of ${data.user.name}`} className="w-10 h-10 rounded-full mr-4"/>
                            <div>
                                <div className="up-ui-title"><span>{data.user.name}</span></div>
                            </div>
                        </a>
                    </Link>
                    <div className="ml-auto">
                        {!isOwner && (
                            <ProfileFollowButton pageUser={data.user} updatePageUser={(newUser: User) => {
                                let newData = {...data};
                                newData.user = newUser;
                                setData(newData);
                            }} userData={userData} setUserData={setUserData}/>
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
                        tags={tags}
                        setTags={setTags}
                        userTags={userData.tags}
                        confirmText="Save changes"
                        cancelText="Cancel"
                    />
                ) : (
                    <>
                        <div className="flex">
                            <div className="mr-4 break-words overflow-hidden">
                                <h1 className="up-h1 mb-4 dark:text-gray-300">{format(dateOnly(thisUpdate.date), "EEEE, MMMM d")}</h1>
                                <h2 className="up-h2 dark:text-gray-300">{thisUpdate.title}</h2>
                                {!!tags.length && (
                                    <div className="flex items-center my-8">
                                        {tags.map(d => (
                                            <a href={`/@${data.user.urlName}?tag=${encodeURIComponent(d)}`} key={d} className="px-2 py-1 bg-neutral-700 hover:bg-neutral-900 transition font-medium border rounded text-sm text-white mr-2">#{d}</a>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-8 md:flex opacity-50 dark:text-gray-300 dark:opacity-75">
                                    <p className="md:mr-12"><b>Created:</b> {format(new Date(thisUpdate.createdAt), "MMMM d 'at' h:mm a")}</p>
                                    <p><b>Last edit:</b> {format(new Date(thisUpdate.updatedAt), "MMMM d 'at' h:mm a")}</p>
                                </div>
                                <div className="flex mt-6 items-center">
                                    <button
                                        className="up-button text small flex items-center mr-6"
                                        onClick={onPressLike}
                                        disabled={!(likesData && likesData.likes)}
                                    >
                                        {isLike ? (
                                            <FiHeart color="red"/>
                                        ) : (
                                            <FiHeart/>
                                        )}
                                        <span className="ml-4">{(likesData && likesData.likes) ? likesData.likes.length : "Loading..."}</span>
                                    </button>
                                    {likesData && likesData.likes && (
                                        <>
                                            {likesData.likes.map((like, i) => (
                                                <Link href={"/@" + like.userArr[0].urlName} key={like.userArr[0].urlName}>
                                                    <a className={i > 4 ? "hidden sm:block" : ""}>
                                                        <img src={like.userArr[0].image} className="w-8 h-8 rounded-full mr-3" alt={like.userArr[0].name}/>
                                                    </a>
                                                </Link>
                                            ))}
                                            {likesData.likes.length > 12 && (
                                                <Link href={`/@${props.data.user.urlName}/${thisUpdate.url}/likes`}>
                                                    <a className="w-8 h-8 rounded-full bg-black text-white items-center hidden sm:inline-flex justify-center">
                                                        +{likesData.likes.length - 12}
                                                    </a>
                                                </Link>
                                            )}
                                            {likesData.likes.length > 5 && (
                                                <Link href={`/@${props.data.user.urlName}/${thisUpdate.url}/likes`}>
                                                    <a className="w-8 h-8 rounded-full bg-black text-white items-center sm:hidden inline-flex justify-center">
                                                        +{likesData.likes.length - 5}
                                                    </a>
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            {isOwner && (
                                <div className="ml-auto">
                                    <MoreMenu
                                        items={[
                                            {label: "Edit", onClick: () => setIsEdit(true)},
                                            {label: "Delete", onClick: () => setIsDelete(true)}
                                        ]}
                                    />
                                </div>
                            )}
                        </div>
                        <hr className="my-8"/>
                        <div className="prose dark:prose-invert content my-8 dark:text-gray-300 break-words overflow-hidden">
                            {Parser(markdownConverter.makeHtml(bodyToParse))}
                        </div>
                        <hr className="my-8"/>
                        <UpdateComments update={thisUpdate} userData={userData}/>
                    </>
                )}
            </div>
            <div className="xl:absolute xl:left-4 xl:top-8 xl:h-full xl:w-56 max-w-3xl mx-auto px-4 xl:mx-0 xl:px-0">
                <hr className="my-8 xl:hidden"/>
                <div className="xl:sticky xl:top-24 dark:text-gray-300">
                    {updates && updates.length > 0 && updates.sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((update) => (
                        <div
                            className={`mb-8 leading-snug ${update._id === thisUpdate._id ? "" : "opacity-50 hover:opacity-100 transition dark:opacity-75"}`}
                            key={update._id}
                        >
                            <Link
                                href={update.published ? `/@${data.user.urlName}/${update.url}` : `/drafts/${update._id}`}
                                shallow={false}
                            >
                                <a>
                                    <div className="font-bold"><span>{update.published ? "" : "DRAFT: "}{format(dateOnly(update.date), "MMMM d, yyyy")}</span></div>
                                    <div className="truncate"><span>{update.title.substr(0,24)}{update.title.length > 24 ? "..." : ""}</span> {update.tags && update.tags.map(d => <span className="opacity-50 mr-1" key={d}>#{d}</span>)}</div>
                                </a>
                            </Link>
                        </div>
                    ))}
                    {numUpdates > 20 && <p
                    className="opacity-50 hover:opacity-100 transition mb-8 dark:opacity-75"
                    ><a href={`/@${data.user.urlName}`}>View all {data.user.name.split(' ')[0]}'s updates</a></p>}
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (Array.isArray(context.params.username) || Array.isArray(context.params.updateUrl) || context.params.username.substring(0, 1) !== "@") return { notFound: true };
    const username: string = context.params.username.substring(1);
    const updateUrl: string = encodeURIComponent(context.params.updateUrl);
    const data = await getUpdateRequest(username, updateUrl);
    if (!data) return { notFound: true };

    const session = await getSession(context);
    const userData = session ? await getCurrUserRequest(session.user.email) : null;

    const isTruePrivate = data.user.truePrivate;

    // this check could happen before the getUpdateRequest fetch tbh...but bleh technical debt
    if (isTruePrivate && (
        !userData ||
        !(
            // following user
            data.user.followers.includes(userData.email) ||
            // or are the user
            data.user._id.toString() === userData._id.toString()
        )
    )) return ssrRedirect(`/@${data.user.urlName}?privateredirect=true`);

    if (userData) await notificationModel.updateMany({userId: userData._id, updateId: data.update._id}, {read: true});

    return { props: { data: cleanForJSON(data), updateUrl: updateUrl, userData: cleanForJSON(userData), key: updateUrl }};
};