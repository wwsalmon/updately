import {GetServerSideProps} from "next";
import {getProfileRequest} from "../api/get-profile";
import {getSession, useSession} from "next-auth/client";
import {format} from "date-fns";
import wordsCount from "words-count";
import Link from "next/link";
import {cleanForJSON, dateOnly} from "../../utils/utils";
import {createAccount, getCurrUserRequest, getProfilesByEmails} from "../../utils/requests";
import React, {useState} from "react";
import FollowButton from "../../components/FollowButton";
import {NextSeo} from "next-seo";

export default function UserProfile(props: { data, userData, followers }) {
    const [session, loading] = useSession();
    const isOwner = !loading && session && (props.data.user.email === session.user.email);
    const [data, setData] = useState<any>(props.data);
    const [userData, setUserData] = useState<any>(props.userData);

    return (
        <div className="max-w-4xl mx-auto px-4">
            <NextSeo
                title={`${data.user.name}'s daily updates | Updately`}
                description={`Follow ${data.user.name} on Updately to get their updates in your feed.`}
            />
            <div className="sm:flex my-8">
                <div className="flex items-center">
                    <div className="w-16 mr-8">
                        <img src={data.user.image} alt={`Profile picture of ${data.user.name}`} className="w-full rounded-full"/>
                    </div>
                    <h1 className="up-h1">{data.user.name}</h1>
                </div>
                <div className="flex sm:ml-auto mt-6 sm:mt-0">
                    <div className="ml-auto">
                        {!isOwner && (
                            <FollowButton data={data} setData={setData} userData={userData} setUserData={setUserData} primary={true}/>
                        )}
                    </div>
                </div>
            </div>

            <div className="my-4">
                <h2 className="up-ui-title">{isOwner ? "Your" : `${props.data.user.name}'s`} followers ({props.followers.length})</h2>
                {isOwner && <p>Have your friends follow you by sharing this profile page with them!</p>}
            </div>
            <div className="flex wrap">
                {props.followers.map(user => (
                    <Link href={"/@" + user.urlName} key={user.urlName}>
                        <a>
                            <img src={user.image} className="w-10 h-10 rounded-full mr-4" alt={user.name}/>
                        </a>
                    </Link>
                ))}
            </div>

            <hr className="my-8"/>

            {data.user.privateView ? (
                <p>This user's profile is private and you do not have permission to view it. Request to follow this user to see their updates.</p>
            ) : (
                <>
                    <div className="flex items-center">
                        <h2 className="up-ui-title my-4">Latest updates</h2>

                        {isOwner && (
                            <Link href="/new-update"><a className="up-button primary my-4 ml-auto">Post new update</a></Link>
                        )}
                    </div>

                    {data.updates.length > 0 ? data.updates.sort((a, b) => +new Date(b.date) - +new Date(a.date)).map(update => (
                        <a key={update._id} className="block my-8" href={`/@${data.user.urlName}/${update.url}`}>
                            <h3 className="up-ui-item-title">{format(dateOnly(update.date), "MMMM d, yyyy")}</h3>
                            <p className="up-ui-item-subtitle">
                                {update.title && (<span className="mr-2">{update.title}</span>)}
                                <span className="opacity-50">{wordsCount(update.body)} word{wordsCount(update.body) > 1 ? "s" : ""}</span>
                            </p>
                        </a>
                    )) : (
                        <p className="up-ui-item-subtitle">No updates yet.</p>
                    )}
                </>
            )}

        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (Array.isArray(context.params.username) || context.params.username.substr(0, 1) !== "@") return { notFound: true };

    const username: string = context.params.username.substr(1);
    const data = await getProfileRequest(username);
    if (!data) return { notFound: true };

    const session = await getSession(context);
    const userData = session ? (session.user.email === data.user.email ? data.user : await getCurrUserRequest(session.user.email)) : null;

    let followers = await getProfilesByEmails(data.user.followers);

    return { props: { data: cleanForJSON(data), userData: cleanForJSON(userData), followers: cleanForJSON(followers), key: data.user._id.toString() }};
};