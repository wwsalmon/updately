import React from 'react';
import {NextSeo} from "next-seo";
import {GetServerSideProps} from "next";
import {getSession} from "next-auth/client";
import {getCurrUserFeedRequest, getCurrUserRequest, getDemoFeedRequest} from "../utils/requests";
import {cleanForJSON} from "../utils/utils";
import {Update, User} from "../utils/types";
import UpdateFeed from "../components/UpdateFeed";
import ExploreSearch from "../components/ExploreSearch";

export default function Explore({userData, feedData}: { userData: User, feedData: {users: User[], updates: Update[]} }) {
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
                <UpdateFeed updates={feedData.updates} users={feedData.users} count={20}/>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const userData = session ? await getCurrUserRequest(session.user.email) : null;
    const feedData = await getDemoFeedRequest();
    return {props: {userData: cleanForJSON(userData), feedData: cleanForJSON(feedData)}};
};