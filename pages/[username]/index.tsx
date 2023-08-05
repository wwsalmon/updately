import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { format } from "date-fns";
import wordsCount from "words-count";
import Link from "next/link";
import { cleanForJSON, dateOnly, fetcher } from "../../utils/utils";
import React, { useEffect, useState } from "react";
import ProfileFollowButton from "../../components/ProfileFollowButton";
import { NextSeo } from "next-seo";
import { SortBy, Update, User } from "../../utils/types";
import UserPfpList from "../../components/UserPfpList";
import UserHeaderLeft from "../../components/UserHeaderLeft";
import { useRouter } from "next/router";
import axios from "axios";
import PaginationBar from "../../components/PaginationBar";
import useSWR from "swr";
import { notificationModel, updateModel, userModel } from "../../models/models";
import { FaSort } from "react-icons/fa";
import getLookup from "../../utils/getLookup";
import ActivityGridWrapper from "../../components/ActivityGridWrapper";

const options = [
    { value: SortBy.Date, label: 'Date' },
    { value: SortBy.WordCount, label: 'Length' },
];


export default function UserProfile(props: { user: UserAgg, userData: User, followers: User[], following: User[] }) {
    const [page, setPage] = useState<number>(1);
    const router = useRouter();
    const isOwner = props.userData && (props.user.email === props.userData.email);
    const [pageUser, setPageUser] = useState<User>(props.user);
    const [userData, setUserData] = useState<User>(props.userData);
    const [sortBy, setSortBy] = useState<SortBy>(SortBy.Date);
    const [filterBy, setFilterBy] = useState<string>("all"); // all, drafts, tag
    const { data: updatesObj, error: feedError } = useSWR(`/api/get-curr-user-updates?page=${page}&urlName=${pageUser.urlName}&sortBy=${sortBy}&filter=${filterBy}`, fetcher);
    const { data: updateActivity, error: updateActivityError } = useSWR(`/api/activity?userId=${pageUser._id}`, fetcher);
    const updates = (updatesObj && updatesObj.length && updatesObj[0].paginatedResults.length) ? updatesObj[0].paginatedResults : [];
    const numUpdates = (updatesObj && updatesObj.length && updatesObj[0].totalCount.length) ? updatesObj[0].totalCount[0].estimatedDocumentCount : 0;

    let filterOptions = [];

    filterOptions.push({ label: "All updates", value: "all" });

    if (isOwner) filterOptions.push(
        { label: "Published", value: "published" },
        { label: "Drafts (only visible to you)", value: "draft" },
    );

    filterOptions.push(...pageUser.tags.map(d => ({ label: `#${d}`, value: d })));

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

    useEffect(() => {
        if (router.query.filter && ["all", "published", "draft", ...filterOptions].map(d => d.value).includes(router.query.filter as string)) {
            setFilterBy(router.query.filter as string);
        }
    }, [router.query.filter]);

    useEffect(() => {
        router.push(`/@${pageUser.urlName}?filter=${encodeURIComponent(filterBy)}`, undefined, { shallow: true });
    }, [filterBy]);

    useEffect(() => {
        setPage(1);
    }, [filterBy]);

    return (
        <div className="max-w-4xl mx-auto px-4">
            <NextSeo
                title={`${pageUser.name}'s daily updates | Updately`}
                description={`Follow ${pageUser.name} on Updately to get their updates in your feed.`}
            />
            <div className="sm:flex mt-16 mb-8">
                <UserHeaderLeft pageUser={pageUser} userData={userData} />
                <div className="flex sm:ml-auto mt-6 sm:mt-0">
                    <div className="ml-auto">
                        {!isOwner && (
                            <ProfileFollowButton pageUser={pageUser} updatePageUser={setPageUser} userData={userData} setUserData={setUserData} primary={true} />
                        )}
                    </div>
                </div>
            </div>

            {(isOwner || pageUser.bio) && (
                <div className="mb-12">
                    {pageUser.bio && (
                        <p className="content mt-2">{pageUser.bio}</p>
                    )}
                    <div className="flex items-center">
                        {!pageUser.bio && (
                            <div>
                                <p className="up-ui-title">Bio</p>
                                <p className="opacity-50">Add a short bio to let others know who you are.</p>
                            </div>
                        )}
                        {(isOwner) && (
                            <Link href={`/@${pageUser.urlName}/edit-profile`}>
                                <a className="up-button text small ml-auto">Edit profile</a>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <Link href={`/@${pageUser.urlName}/following`}>
                <a className="up-ui-title mb-4 block">
                    Following ({props.following.length})
                </a>
            </Link>
            <UserPfpList userList={props.following} pageUser={pageUser} isFollowers={false} />

            <div className="mb-4 mt-12">
                <Link href={`/@${pageUser.urlName}/followers`}>
                    <a className="up-ui-title">
                        Followers ({props.followers.length})
                    </a>
                </Link>
                {isOwner && <p>Have your friends follow you by sharing this profile page with them!</p>}
            </div>
            <UserPfpList userList={props.followers} pageUser={pageUser} isFollowers={true} />

            <div className="mt-12">
                <p className="opacity-50">{pageUser.name} joined Updately on {format(new Date(pageUser.createdAt), "MMMM d, yyyy")}</p>
            </div>

            <hr className="my-8" />

            <div className="mb-16 mt-10">
                <ActivityGridWrapper updates={updateActivity || []} />
            </div>

            {(pageUser.private || pageUser.truePrivate) && (!userData || !pageUser.followers.includes(props.userData.email) && !isOwner) ? (
                <p>This user's profile is private and you do not have permission to view it. Request to follow this user to see their updates.</p>
            ) : (
                <>
                    {isOwner && (
                        <div className="flex mt-6 mb-8 justify-end">
                            <>
                                <Link href="/edit-template">
                                    <a className="up-button text small mr-4">Edit template</a>
                                </Link>
                                <Link href="/new-update">
                                    <a className="up-button primary small">Post new update</a>
                                </Link>
                            </>
                        </div>
                    )}
                    <div className="flex items-center mb-12">
                        <select value={filterBy} onChange={e => setFilterBy(e.target.value)} className="up-ui-title">
                            {filterOptions.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                        <div className="flex items-center ml-auto">
                            <p className="up-ui-title mr-2 text-gray-400"><FaSort /></p>
                            <select value={sortBy} onChange={e => setSortBy(+e.target.value)}>
                                {options.map(d => (
                                    <option value={d.value} key={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {updates && updates.length > 0 ? updates.map(update => (
                        <div
                            key={update._id}
                            className="my-8"
                        >
                            <h3 className="up-ui-item-title"><a href={update.published ? `/@${pageUser.urlName}/${update.url}` : `/drafts/${update._id}`}>{update.published ? "" : "DRAFT: "}{format(dateOnly(update.date), "MMMM d, yyyy")}</a></h3>
                            <div className="flex items-center flex-wrap">
                                <p className="up-ui-item-subtitle mr-4">
                                    <a href={update.published ? `/@${pageUser.urlName}/${update.url}` : `/drafts/${update._id}`}>
                                        {update.title && (<span className="mr-2">{update.title}</span>)}
                                        <span className="opacity-50">{wordsCount(update.body)} word{wordsCount(update.body) > 1 ? "s" : ""}</span>
                                    </a>
                                </p>
                                {update.tags && update.tags.map(tag => (
                                    <button onClick={() => setFilterBy(tag)} key={tag} className="px-2 py-1 bg-gray-700 hover:bg-gray-900 transition font-medium border rounded text-xs text-white mr-2">#{tag}</button>
                                ))}
                            </div>
                        </div>
                    )) : (
                        <p className="up-ui-item-subtitle">No updates yet.</p>
                    )}
                    {updates && updates.length > 0 && <PaginationBar page={page} count={numUpdates} label={"updates"} setPage={setPage} />}
                </>
            )}

        </div>
    )
}

type UserAgg = User & { followingArr: User[], followersArr: User[] };

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (Array.isArray(context.params.username) || context.params.username.substring(0, 1) !== "@") return { notFound: true };

    const username: string = context.params.username.substring(1);

    const session = await getSession(context);
    const userArr: UserAgg[] = await userModel.aggregate([
        { $match: { urlName: username } },
        getLookup("users", "_id", "following", "followingArr"),
        getLookup("users", "email", "followers", "followersArr"),
    ]);

    if (!userArr.length) return { notFound: true };

    const user = userArr[0];

    const thisUser = session ? await userModel.findOne({ email: session.user.email }) : null;
    if (thisUser) await notificationModel.updateMany({ userId: thisUser._id, type: "follow", authorId: user._id }, { read: true });

    return { props: { user: cleanForJSON(user), userData: cleanForJSON(thisUser), followers: cleanForJSON(user.followersArr), following: cleanForJSON(user.followingArr), key: user._id.toString() } };
};