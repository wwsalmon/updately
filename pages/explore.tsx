import React from 'react';
import {NextSeo} from "next-seo";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/client";
import {getCurrUserRequest} from "../utils/requests";
import {cleanForJSON} from "../utils/utils";
import {User} from "../utils/types";
import UpdateFeed from "../components/UpdateFeed";
import ExploreSearch from "../components/ExploreSearch";
import {useState} from "react";
import {fetcher} from "../utils/utils";
import useSWR from "swr";

export default function Explore(props: {userData: User}) {
    const [page, setPage] = useState<number>(1);
    const {data: feedDataObj, error: feedError} = useSWR(`/api/get-curr-user-feed?page=${page}&explore=${true}`, fetcher);
    const feedData = feedDataObj ? feedDataObj.feedData : {users: [], updates: []};
    const userData = props.userData;

    return (
        <>
            <NextSeo
                title="Explore | Updately: Social platform for daily updates"
                description="Write daily updates, share them with friends, and see friends' updates for social accountability and goal-setting."
            />
            <div className="max-w-4xl relative mx-auto px-4">
                <h1 className="up-h1 mt-16">Explore</h1>
                <p className="my-6">See the latest updates from all public Updately users, or search for a specific user.</p>
                <hr className="my-8"/>
                <ExploreSearch userData={userData}/>
                <UpdateFeed updates={feedData.updates || []} users={feedData.users || []} page={page} setPage={setPage} count={feedData.count}/>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const userData = session ? await getCurrUserRequest(session.user.email) : null;

    return {props: {userData: cleanForJSON(userData)}};
};