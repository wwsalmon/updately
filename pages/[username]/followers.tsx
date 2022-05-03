import React from "react";
import {GetServerSideProps} from "next";
import {getProfileReducedRequest} from "../api/get-profile";
import {getSession} from "next-auth/react";
import {getCurrUserRequest, getProfilesByEmails} from "../../utils/requests";
import {cleanForJSON} from "../../utils/utils";
import {User} from "../../utils/types";
import UserFollowListPage from "../../components/UserFollowListPage";

export default function UserFollowersPage({pageUser, userData, followers}: { pageUser: User, userData: User, followers: User[] }) {
    return (
        <UserFollowListPage pageUser={pageUser} userData={userData} userList={followers} isFollowers={true}/>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (Array.isArray(context.params.username) || context.params.username.substr(0, 1) !== "@") return { notFound: true };
    const username: string = context.params.username.substr(1);
    const pageUser = await getProfileReducedRequest(username);
    if (!pageUser) return { notFound: true };

    const session = await getSession(context);
    const userData = session ? (session.user.email === pageUser.email ? pageUser : await getCurrUserRequest(session.user.email)) : null;

    const followers = await getProfilesByEmails(pageUser.followers);

    return { props: { pageUser: cleanForJSON(pageUser), userData: cleanForJSON(userData), followers: cleanForJSON(followers), key: pageUser._id.toString() }};
};