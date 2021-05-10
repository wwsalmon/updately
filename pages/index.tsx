import {getSession, useSession} from 'next-auth/client';
import {GetServerSideProps} from "next";
import {getCurrUserFeedRequest, getDemoFeedRequest} from "../utils/requests";
import React from "react";
import Link from "next/link";
import UpdateFeed from "../components/UpdateFeed";
import { NextSeo } from 'next-seo';
import {cleanForJSON} from "../utils/utils";
import {Update, User} from "../utils/types";
import UserPfpList from "../components/UserPfpList";
import {fetcher} from "../utils/utils";
import useSWR from "swr";
import {useState} from 'react'

export default function Home({userData}: {userData: User}) {
    const [page, setPage] = useState<number>(1);
    const {data: feedDataObj, error: feedError} = useSWR(`/api/get-curr-user-feed?page=${page}`, fetcher);
    const feedData = feedDataObj ? feedDataObj.feedData : {users: [], updates: []};

    return (
        <>
            <NextSeo
                title={userData ? "Your feed | Updately" : "Updately: Social platform for daily updates"}
                description="Write daily updates, share them with friends, and see friends' updates for social accountability and goal-setting."
            />
            <div className="max-w-4xl relative mx-auto px-4">
                {userData ? (
                    <>
                        <h1 className="up-h1 mt-16">Your feed</h1>
                        <div className="my-6">
                            <Link href={`@${userData.urlName}/following`}>
                                <a className="up-ui-title">
                                    Following ({userData.following.length})
                                </a>
                            </Link>
                            <p>Ask friends to share their Updately profiles with you, <Link href="/explore"><a className="underline">or search for them by name</a></Link>!</p>
                        </div>
                        <UserPfpList isFollowers={false} userList={feedData.users || []} pageUser={userData}/>
                        <UpdateFeed updates={feedData.updates || []} users={feedData.users || []} page={page} setPage={setPage} count={feedData.count}/>
                    </>
                ) : (
                    <>
                        <h1 className="up-h1 mt-16">Welcome to Updately!</h1>
                        <div className="prose content my-6">
                            <p>Updately is a <b>social platform for daily updates</b> (or weekly or hourly, whatever works for you).</p>
                            <p>How it works is pretty straightforward:</p>
                            <ol>
                                <li>Post an update on Updately</li>
                                <li>Everyone who follows you will see it in their feed</li>
                                <li>Follow your friends or coworkers on Updately</li>
                                <li>See their updates in your feed</li>
                            </ol>
                            <p>Check out some (real!) examples:</p>
                        </div>
                        <UpdateFeed updates={feedData.updates || []} users={feedData.users || []} page={page} setPage={setPage} count={feedData.count}/>
                        <div className="prose content my-6">
                            <p>So what are you waiting for? <b>Hit that blue button on the navbar to sign up now!</b></p>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

