import {format, formatDistanceToNow} from "date-fns";
import {dateOnly} from "../utils/utils";
import Link from "next/link";
import React from "react";
import wordsCount from "words-count";

export default function UpdateFeed({feedData, count}: {feedData: any, count: number}) {
    let feedUpdates: any[] = [];

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
        }
        feedUpdates.sort((a, b) => +new Date(b.date) - +new Date(a.date));
        feedUpdates = feedUpdates.slice(0, count);
    }

    return (
        <>
            {feedUpdates.length > 0 ? feedUpdates.map((update, i) => (
                <div key={update._id}>
                    {(i === 0 || update.date !== feedUpdates[i - 1].date) && (
                        <>
                            <hr className="my-8"/>
                            <h3 className="up-ui-title mt-12 mb-6">{format(dateOnly(update.date), "EEEE, MMMM d, yyyy")}</h3>
                        </>
                    )}
                    <Link href={"/@" + update.author.urlName + "/" + update.url}>
                        <a>
                            <div className="sm:flex items-center">
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
                                </div>
                                <div className="ml-auto flex-shrink-0 mb-4 sm:mb-0">
                                    <p className="opacity-50">{formatDistanceToNow(new Date(update.createdAt))} ago</p>
                                </div>
                            </div>
                        </a>
                    </Link>
                </div>
            )) : (
                <div className="prose content my-6">
                    <p>Looks like the users you're following haven't posted anything yet. Follow more people or remind your friends to write their updates!</p>
                </div>
            )}
        </>
    )
}