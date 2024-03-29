import {getSession, signIn} from "next-auth/react";
import {GetServerSideProps} from "next";
import {getCurrUserRequest} from "../utils/requests";
import React from "react";
import Link from "next/link";
import UpdateFeed from "../components/UpdateFeed";
import { NextSeo } from 'next-seo';
import {cleanForJSON} from "../utils/utils";
import {DatedObj, FeedItem, User} from "../utils/types";
import UserPfpList from "../components/UserPfpList";
import {fetcher} from "../utils/utils";
import useSWR, {responseInterface} from "swr";
import {useState} from "react";

export default function Home(props: {userData: User}) {
    const [page, setPage] = useState<number>(1);

    const {
        data: feedDataObj,
        error: feedError
    }: responseInterface<{
        userData: DatedObj<User>,
        feedData: {count: number, updates: FeedItem[]}
    }, any> = useSWR(`/api/get-curr-user-feed?page=${page}`, fetcher);

    const {
        data: followingData,
        error: followingError
    }: responseInterface<{
        users: DatedObj<User>[],
    }, any> = useSWR(`/api/get-curr-user-following`, fetcher);

    const feedData = feedDataObj ? feedDataObj.feedData : {count: 0, updates: []};
    const following = followingData ? followingData.users : [];
    const userData = props.userData;

    return (
        <>
            <NextSeo
                title={userData ? "Your feed | Updately" : "Updately: Social platform for daily updates"}
                description="Write daily updates, share them with friends, and see friends' updates for social accountability and goal-setting."
            />
            {userData ? (
                <div className="max-w-4xl relative mx-auto px-4">
                    <h1 className="up-h1 mt-16">Your feed</h1>
                    <div className="my-6">
                        <Link href={`/@${userData.urlName}/following`}>
                            <a className="up-ui-title">
                                Following ({userData.following.length})
                            </a>
                        </Link>
                        <p>Ask friends to share their Updately profiles with you, <Link href="/explore"><a className="underline">or search for them by name</a></Link>!</p>
                    </div>
                    <UserPfpList isFollowers={false} userList={following} pageUser={userData}/>
                    <UpdateFeed updates={feedData ? feedData.updates : []} page={page} setPage={setPage} count={feedData ? feedData.count : 0}/>
                </div>
            ) : (
                <>
                    <div className="w-full -mt-6 px-4 sm:px-8 text-white" style={{backgroundColor: "#222"}}>
                        <div className="max-w-6xl mx-auto py-20 md:flex items-center">
                            <div className="md:mr-16">
                                <h1 className="text-4xl lg:text-6xl up-font-serif font-medium" style={{lineHeight: 1.25}}>
                                    Share daily updates with friends<span className="opacity-75">*</span>
                                </h1>
                                <p className="opacity-50 mt-6">*or weekly updates with teammates, or sporadic updates with besties.</p>
                                <p className="opacity-75 text-xl leading-normal mt-6">Updately is a social platform that makes it easy for you to <b>stay in sync,</b> with yourself and others, to live a more <b>intentional and productive</b> life.</p>
                                <div className="flex items-center mt-8">
                                    <button onClick={() => signIn("google")} className="up-button primary mr-4">Get started</button>
                                </div>
                            </div>
                            <img src="/updately-hero.png" alt="Updately hero image" className="md:w-1/2 mt-12 md:mt-0"/>
                        </div>
                    </div>
                    <div className="max-w-4xl relative mx-auto px-4">
                        <p className="mt-16 text-xl">See what others are posting or <a className="underline" href="/explore">search for a specific user</a></p>
                        <UpdateFeed updates={feedData.updates || []} page={page} setPage={setPage} count={feedData.count}/>
                    </div>
                </>
            )}
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const userData = session ? await getCurrUserRequest(session.user.email) : null;

    return {props: {userData: cleanForJSON(userData)}};
};