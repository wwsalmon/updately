import {format, formatDistanceToNow} from "date-fns";
import {dateOnly} from "../utils/utils";
import Link from "next/link";
import React from "react";
import wordsCount from "words-count";
import {FeedItem, Update, User} from "../utils/types";
import PaginationBanner from '../components/PaginationBanner';
import {FiLock} from "react-icons/fi";

export default function UpdateFeed({updates, page, setPage, count}: {updates: FeedItem[], page: number, setPage: any, count: number}) {
    return (
        <>
            <hr className="my-8"/>
            <PaginationBanner page={page} setPage={setPage} label="updates" className="my-12"/>
            {updates.length > 0 ? updates.sort((a, b) => (+new Date(b.date) - +("private" in b)) - (+new Date(a.date) - +("private" in a))).map((update, i) => {
                return (
                    <div key={("private" in update) ? `private-${update.date}` : update._id}>
                        {(i === 0 || update.date !== updates[i - 1].date) && (
                            <>
                                <h3 className="up-ui-title mt-12 mb-6 dark:text-gray-300">{format(dateOnly(update.date), "EEEE, MMMM d, yyyy")}</h3>
                            </>
                        )}
                        {("private" in update) ? (
                            <div className="flex items-center my-6">
                                <div className="w-16 h-16 rounded-full mr-4 flex items-center justify-center bg-gray-100 dark:bg-opacity-20">
                                    <span className="text-center text-xl"><FiLock/></span>
                                </div>
                                <p className="text-xl opacity-50">{update.count} private update{update.count === 1 ? "" : "s"}</p>
                            </div>
                        ) : (
                            <Link href={"/@" + update.userArr[0].urlName + "/" + update.url}>
                                <a>
                                    <div className="sm:flex items-center break-words overflow-hidden">
                                        <div className="flex items-center">
                                            <img
                                                src={update.userArr[0].image}
                                                alt={`Profile picture of ${update.userArr[0].name}`}
                                                className="w-16 h-16 rounded-full mr-4"
                                            />
                                            <div className="my-6 leading-snug mr-4 dark:text-gray-300 break-words overflow-hidden">
                                                <div className="up-ui-item-title"><span>{update.userArr[0].name}</span></div>
                                                <p className="up-ui-item-subtitle">
                                                    {update.title && (<span className="mr-2">{update.title}</span>)}
                                                    <span className="opacity-50">{wordsCount(update.body)} word{wordsCount(update.body) > 1 ? "s" : ""}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="ml-auto flex-shrink-0 mb-4 sm:mb-0">
                                            <p className="opacity-50 dark:text-gray-300">{formatDistanceToNow(new Date(update.createdAt))} ago</p>
                                        </div>
                                    </div>
                                </a>
                            </Link>
                        )}
                        {(i === updates.length - 1 || update.date !== updates[i + 1].date) && (
                            <>
                                <hr className="my-8"/>
                            </>
                        )}
                    </div>
                )
            }) : (
                <div className="prose content my-6 dark:opacity-70">
                    <p>Looks like the users you're following haven't posted anything yet. Follow more people or remind your friends to write their updates!</p>
                </div>
            )}
            {updates && count > 20 && (
                <div className="flex my-12">
                    <button
                        className="text small up-button"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        Back
                    </button>
                    <button
                        className="ml-auto text small up-button"
                        onClick={() => setPage(page + 1)}
                        disabled={page === Math.floor(count / 20)}
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    )
}