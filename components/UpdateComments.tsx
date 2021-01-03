import React, {useState} from 'react';
import {CommentObj, User} from "../utils/types";
import useSWR from "swr";
import {fetcher} from "../utils/utils";
import axios from "axios";
import {format} from "date-fns";
import Link from "next/link";
import {FiCornerUpRight} from "react-icons/fi";
import UpdateCommentForm from "./UpdateCommentForm";

export default function UpdateComments({updateId, userData}: { updateId: string, userData: User }) {
    const [refreshIteration, setRefreshIteration] = useState<number>(0);
    const {data, error} = useSWR(`/api/get-comments?updateId=${updateId}&?iter=${refreshIteration}`, fetcher);

    return (
        <>
            <div className="up-ui-title mb-4"><span>Comments {data ? `(${data.comments.length})` : ""}</span></div>
            <div className="my-4">
                <UpdateCommentForm
                    updateId={updateId}
                    userData={userData}
                    callback={() => setRefreshIteration(refreshIteration + 1)}
                    onCancel={() => null}
                />
            </div>
            <div className="my-4">
                {data && data.comments.map((comment: CommentObj) => (
                    <div className="flex mb-8">
                        <Link href={`/@${data.users.find(d => d._id === comment.authorId).urlName}`}>
                            <a>
                                <img
                                    src={data.users.find(d => d._id === comment.authorId).image}
                                    alt={`Profile picture of ${data.users.find(d => d._id === comment.authorId).name}`}
                                    className="w-10 h-10 rounded-full mr-4 mt-2"
                                />
                            </a>
                        </Link>
                        <div className="ml-2 w-full">
                            <p>
                                <Link href={`/@${data.users.find(d => d._id === comment.authorId).urlName}`}>
                                    <a>
                                        <b>{data.users.find(d => d._id === comment.authorId).name}</b>
                                    </a>
                                </Link>
                                <span className="opacity-50 ml-4">
                                    {format(new Date(comment.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                                </span>
                            </p>
                            <p className="text-xl">{comment.body}</p>
                            <button className="opacity-25 hover:opacity-75 mt-2 inline-flex items-center">
                                <FiCornerUpRight/>
                                <span className="ml-2">Reply</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}