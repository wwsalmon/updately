import React, {Dispatch, SetStateAction, useState} from 'react';
import {CommentObj, User} from "../utils/types";
import Link from "next/link";
import {format} from "date-fns";
import {FiCornerUpRight} from "react-icons/fi";
import UpdateCommentForm from "./UpdateCommentForm";

export default function UpdateCommentItem({comment, users, userData, refreshIteration, setRefreshIteration}: {
    comment: CommentObj,
    users: User[],
    userData: User,
    refreshIteration: number,
    setRefreshIteration: Dispatch<SetStateAction<number>>,
}) {
    const [replyOpen, setReplyOpen] = useState<boolean>(false);

    return (
        <div className="flex">
            <Link href={`/@${users.find(d => d._id === comment.authorId).urlName}`}>
                <a>
                    <img
                        src={users.find(d => d._id === comment.authorId).image}
                        alt={`Profile picture of ${users.find(d => d._id === comment.authorId).name}`}
                        className="w-10 h-10 rounded-full mr-4 mt-2"
                    />
                </a>
            </Link>
            <div className="ml-2 w-full">
                <p>
                    <Link href={`/@${users.find(d => d._id === comment.authorId).urlName}`}>
                        <a>
                            <b>{users.find(d => d._id === comment.authorId).name}</b>
                        </a>
                    </Link>
                    <span className="opacity-50 ml-4">
                                    {format(new Date(comment.createdAt), "M/d/yyyy 'at' h:mm a")}
                                </span>
                </p>
                <p className="sm:text-xl">{comment.body}</p>
                <button
                    className={`opacity-25 mt-2 inline-flex items-center ${replyOpen ? "cursor-default" : "hover:opacity-75"}`}
                    onClick={() => setReplyOpen(true)}
                    disabled={replyOpen}
                >
                    <FiCornerUpRight/>
                    <span className="ml-2">{replyOpen ? "Replying" : "Reply"}</span>
                </button>
                {replyOpen && (
                    <div className="my-4">
                        <UpdateCommentForm
                            updateId={comment.updateId}
                            userData={userData}
                            parentCommentId={comment.parentCommentId || comment._id}
                            callback={() => setRefreshIteration(refreshIteration + 1)}
                            onCancel={() => setReplyOpen(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}