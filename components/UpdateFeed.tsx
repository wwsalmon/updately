import {format, formatDistanceToNow} from "date-fns";
import {dateOnly} from "../utils/utils";
import Link from "next/link";
import React from "react";
import wordsCount from "words-count";
import {Update, User} from "../utils/types";
import PaginationBanner from '../components/PaginationBanner';

export default function UpdateFeed({updates, users, page, setPage, count}: {updates: Update[], users: User[], page: number, setPage: any, count: number}) {

    return (
        <>
            <hr className="my-8"/>
            <PaginationBanner page={page} setPage={setPage} label="updates" className="my-12"/>
            {updates.length > 0 ? updates.map((update, i) => (
                <div key={update._id}>
                    {(i === 0 || update.date !== updates[i - 1].date) && (
                        <>
                            <h3 className="up-ui-title mt-12 mb-6">{format(dateOnly(update.date), "EEEE, MMMM d, yyyy")}</h3>
                        </>
                    )}
                    <Link href={"/@" + users.find(d => d._id === update.userId).urlName + "/" + update.url}>
                        <a>
                            <div className="sm:flex items-center">
                                <div className="flex items-center">
                                    <img
                                        src={users.find(d => d._id === update.userId).image}
                                        alt={`Profile picture of ${users.find(d => d._id === update.userId).name}`}
                                        className="w-16 h-16 rounded-full mr-4"
                                    />
                                    <div className="my-6 leading-snug mr-4">
                                        <div className="up-ui-item-title"><span>{users.find(d => d._id === update.userId).name}</span></div>
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
                    {(i === updates.length - 1 || update.date !== updates[i + 1].date) && (
                        <>
                            <hr className="my-8"/>
                        </>
                    )}
                </div>
            )) : (
                <div className="prose content my-6">
                    <p>Looks like the users you're following haven't posted anything yet. Follow more people or remind your friends to write their updates!</p>
                </div>
            )}
            {updates && users && (
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
                        disabled={page === Math.floor(count / 10)}
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    )
}