import React from 'react';
import {GetServerSideProps} from "next";
import {getProfileReducedRequest} from "../api/get-profile";
import {getSession} from "next-auth/client";
import {getCurrUserRequest, getProfilesByIds} from "../../utils/requests";
import {cleanForJSON} from "../../utils/utils";
import {User} from "../../utils/types";
import UserFollowListPage from "../../components/UserFollowListPage";

export default function UserFollowersPage({pageUser, userData, following}: { pageUser: User, userData: User, following: User[] }) {
    return (
        <UserFollowListPage pageUser={pageUser} userData={userData} userList={following} isFollowers={false}/>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (Array.isArray(context.params.username) || context.params.username.substr(0, 1) !== "@") return { notFound: true };
    const username: string = context.params.username.substr(1);
    const pageUser = await getProfileReducedRequest(username);
    if (!pageUser) return { notFound: true };

    const session = await getSession(context);
    const userData = session ? (session.user.email === pageUser.email ? pageUser : await getCurrUserRequest(session.user.email)) : null;

    const following = await getProfilesByIds(pageUser.following);

    return { props: { pageUser: cleanForJSON(pageUser), userData: cleanForJSON(userData), following: cleanForJSON(following), key: pageUser._id.toString() }};
};