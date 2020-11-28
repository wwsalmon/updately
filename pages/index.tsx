import {getSession, useSession} from 'next-auth/client';
import {GetServerSideProps} from "next";
import {getCurrUserFeedRequest} from "../utils/requests";
import {dateOnly} from "../utils/utils";
import {format, formatDistanceToNow} from "date-fns";
import React from "react";
import wordsCount from "words-count";
import Link from "next/link";

export default function Home({userData, feedData}) {
    const [session, loading] = useSession();

    console.log(userData, feedData);

    let feedUpdates: any[] = [];
    let followUsers: {
        name: string,
        image: string,
        urlName: string,
    }[] = [];

    if (feedData) {
        for (let user of feedData) {
            for (let update of user.updates) {
                let updateObj = {
                    ...update,
                    author: {
                        name: user.name,
                        image: user.image,
                        urlName: user.urlName,
                    }
                };
                feedUpdates.push(updateObj);
            }
            followUsers.push({
                name: user.name,
                image: user.image,
                urlName: user.urlName,
            });
        }
        feedUpdates.sort((a, b) => +new Date(b.date) - +new Date(a.date));
        feedUpdates = feedUpdates.slice(0, 20);
    }

    return (
        <>
            <div className="max-w-4xl relative mx-auto px-4">
                <div className="flex items-center">
                    <h1 className="up-h1">Your feed</h1>
                    <Link href={"/@" + userData.urlName}><a className="up-button text ml-auto">Your profile</a></Link>
                    <Link href="/new-update"><a className="up-button primary ml-4">Post new update</a></Link>
                </div>
                <div className="my-6">
                    <h3 className="up-ui-title">Following ({followUsers.length})</h3>
                    <p>Ask friends to share their Updately profiles with you to follow them!</p>
                </div>
                <div className="flex wrap">
                    {followUsers.map(user => (
                        <Link href={"/@" + user.urlName}>
                            <a>
                                <img src={user.image} className="w-10 h-10 rounded-full mr-4" alt={user.name}/>
                            </a>
                        </Link>
                    ))}
                </div>
                {feedUpdates.map((update, i) => (
                    <>
                        {(i === 0 || update.date !== feedUpdates[i - 1].date) && (
                            <>
                                <hr className="my-8"/>
                                <h3 className="up-ui-title mt-12 mb-6">{format(dateOnly(update.date), "EEEE, MMMM dd, yyyy")}</h3>
                            </>
                        )}
                        <Link href={"/@" + update.author.urlName + "/" + update.url}>
                            <a>
                                <div className="flex items-center">
                                    <img
                                        src={update.author.image}
                                        alt={`Profile picture of ${update.author.name}`}
                                        className="w-16 h-16 rounded-full mr-4"
                                    />
                                    <div className="my-6 leading-snug mr-4">
                                        <div className="up-ui-item-title"><span>{update.author.name}</span></div>
                                        <p className="up-ui-item-subtitle">
                                            {update.title && (<span className="mr-2">{update.title}</span>)}
                                            <span className="opacity-50">{wordsCount(update.body)} word{wordsCount(update.body) > 1 ? "s" : ""}</span>
                                        </p>
                                    </div>
                                    <div className="ml-auto flex-shrink-0">
                                        <p className="opacity-50">{formatDistanceToNow(new Date(update.createdAt))} ago</p>
                                    </div>
                                </div>
                            </a>
                        </Link>
                    </>
                ))}
            </div>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return {props: {userData: null, feedData: null}}
    }

    const {userData, feedData} = await getCurrUserFeedRequest(session.user.email);

    return {props: {userData: JSON.parse(JSON.stringify(userData)), feedData: JSON.parse(JSON.stringify(feedData))}};
}