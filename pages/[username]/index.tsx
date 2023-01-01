import {GetServerSideProps} from "next";
import {getProfileRequest} from "../api/get-profile";
import {getSession} from "next-auth/react";
import {format} from "date-fns";
import wordsCount from "words-count";
import Link from "next/link";
import {cleanForJSON, dateOnly, fetcher} from "../../utils/utils";
import {getCurrUserRequest, getProfilesByEmails, getProfilesByIds} from "../../utils/requests";
import React, {useEffect, useState} from "react";
import ProfileFollowButton from "../../components/ProfileFollowButton";
import {NextSeo} from "next-seo";
import {SortBy, Update, User} from "../../utils/types";
import UserPfpList from "../../components/UserPfpList";
import UserHeaderLeft from "../../components/UserHeaderLeft";
import {useRouter} from "next/router";
import axios from "axios";
import PaginationBar from "../../components/PaginationBar";
import useSWR from "swr";
import {notificationModel, updateModel, userModel} from "../../models/models";
import CustomSelect from "../../components/CustomSelect";

const options = [
	{ value: SortBy.Date, label: 'Date' },
	{ value: SortBy.WordCount, label: 'Length' },
];


export default function UserProfile(props: { data: {user: User, updates: Update[]}, userData: User, followers: User[], following: User[], draftCount: number }) {
    const [page, setPage] = useState<number>(1);
    const router = useRouter();
    const isOwner = props.userData && (props.data.user.email === props.userData.email);
    const [data, setData] = useState<{user: User, updates: Update[]}>(props.data);
    const [userData, setUserData] = useState<User>(props.userData);
    const [sortBy, setSortBy] = useState<SortBy>(SortBy.Date);
    const {data: updates, error: feedError} = useSWR(`/api/get-curr-user-updates?page=${page}&urlName=${data.user.urlName}&sortBy=${sortBy}`, fetcher);

    useEffect(() => {
        if (router.query.notification) {
            axios.post("/api/read-notification", {
                id: router.query.notification,
            }).then(res => {
                console.log(res);
            }).catch(e => {
                console.log(e);
            });
        }
    }, [router.query.notification]);

    return (
        <div className="max-w-4xl mx-auto px-4">
            <NextSeo
                title={`${data.user.name}'s daily updates | Updately`}
                description={`Follow ${data.user.name} on Updately to get their updates in your feed.`}
            />
            <div className="sm:flex mt-16 mb-8">
                <UserHeaderLeft pageUser={data.user} userData={userData}/>
                <div className="flex sm:ml-auto mt-6 sm:mt-0">
                    <div className="ml-auto">
                        {!isOwner && (
                            <ProfileFollowButton data={data} setData={setData} userData={userData} setUserData={setUserData} primary={true}/>
                        )}
                    </div>
                </div>
            </div>

            {(isOwner || data.user.bio) && (
                <div className="mb-12">
                    {data.user.bio && (
                        <p className="content mt-2">{data.user.bio}</p>
                    )}
                    <div className="flex items-center">
                        {!data.user.bio && (
                            <div>
                                <p className="up-ui-title">Bio</p>
                                <p className="opacity-50">Add a short bio to let others know who you are.</p>
                            </div>
                        )}
                        {(isOwner) && (
                            <Link href={`/@${data.user.urlName}/edit-profile`}>
                                <a className="up-button text small ml-auto">Edit profile</a>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <Link href={`/@${data.user.urlName}/following`}>
                <a className="up-ui-title mb-4 block">
                    Following ({props.following.length})
                </a>
            </Link>
            <UserPfpList userList={props.following} pageUser={data.user} isFollowers={false}/>

            <div className="mb-4 mt-12">
                <Link href={`/@${data.user.urlName}/followers`}>
                    <a className="up-ui-title">
                        Followers ({props.followers.length})
                    </a>
                </Link>
                {isOwner && <p>Have your friends follow you by sharing this profile page with them!</p>}
            </div>
            <UserPfpList userList={props.followers} pageUser={data.user} isFollowers={true}/>

            <div className="mt-12">
                <p className="opacity-50">{data.user.name} joined Updately on {format(new Date(data.user.createdAt), "MMMM d, yyyy")}</p>
            </div>

            <hr className="my-8"/>

            {(data.user.private || data.user.truePrivate) && (!userData || !data.user.followers.includes(props.userData.email) && !isOwner) ? (
                <p>This user's profile is private and you do not have permission to view it. Request to follow this user to see their updates.</p>
            ) : (
                <>
                    <div className="flex flex-col-reverse sm:flex-row sm:items-center">
                        <p className="up-ui-title">Sort by:</p>
                        <div className="flex-auto mx-2 mt-4 mb-12 sm:mb-4">
                            <CustomSelect
                                options={options}
                                defaultValue={options.find(x => x.value == SortBy.Date)}
                                onChange={option => setSortBy(option.value)}
                                isSearchable={false}
                                className="rounded-md text-xl"
                            />
                        </div>
                        {isOwner ? (
                            <>
                            <div className="flex ml-auto mt-4 mb-12 sm:mb-4">
                                <Link href="/edit-template">
                                    <a className="up-button text small ml-auto mr-4">Edit template</a>
                                </Link>
                                <Link href="/new-update">
                                    <a className="up-button primary small">Post new update</a>
                                </Link>
                            </div>
                            </>
                        ) :  (
                            <h2 className="up-ui-title">Latest updates ({data.updates.length})</h2>
                        )}
                        
                    </div>

                    {updates && updates.length > 0 ? updates.map(update => (
                        <a
                            key={update._id}
                            className="block my-8"
                            href={update.published ? `/@${data.user.urlName}/${update.url}` : `/drafts/${update._id}`}
                        >
                            <h3 className="up-ui-item-title">{update.published ? "" : "DRAFT: "}{format(dateOnly(update.date), "MMMM d, yyyy")}</h3>
                            <p className="up-ui-item-subtitle">
                                {update.title && (<span className="mr-2">{update.title}</span>)}
                                <span className="opacity-50">{wordsCount(update.body)} word{wordsCount(update.body) > 1 ? "s" : ""}</span>
                            </p>
                        </a>
                    )) : (
                        <p className="up-ui-item-subtitle">No updates yet.</p>
                    )}
                    {updates && updates.length > 0 && <PaginationBar page={page} count={data.updates.length} label={"updates"} setPage={setPage}/>}
                </>
            )}

        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (Array.isArray(context.params.username) || context.params.username.substr(0, 1) !== "@") return { notFound: true };

    const username: string = context.params.username.substr(1);

    const session = await getSession(context);
    const thisUser = session ? await userModel.findOne({email: session.user.email}) : null;

    const data = await getProfileRequest(username, thisUser);
    if (!data) return { notFound: true };

    if (thisUser) await notificationModel.updateMany({userId: thisUser._id, type: "follow", authorId: data.user._id}, {read: true});

    let followers = await getProfilesByEmails(data.user.followers);
    let following = await getProfilesByIds(data.user.following);

    return { props: { data: cleanForJSON(data), userData: cleanForJSON(thisUser), followers: cleanForJSON(followers), following: cleanForJSON(following), key: data.user._id.toString() }};
};