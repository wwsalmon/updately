import React, {useState} from 'react';
import {CommentObj, User} from "../utils/types";
import useSWR from "swr";
import {fetcher} from "../utils/utils";
import axios from "axios";
import {format} from "date-fns";
import Link from "next/link";

export default function UpdateComments({updateId, userData}: { updateId: string, userData: User }) {
    const [refreshIteration, setRefreshIteration] = useState<number>(0);
    const {data, error} = useSWR(`/api/get-comments?updateId=${updateId}&?iter=${refreshIteration}`, fetcher);
    const [commentText, setCommentText] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function postComment() {
        setIsLoading(true);

        axios.post("/api/new-comment", {
            commentText: commentText,
            authorId: userData._id,
            updateId: updateId,
        }).then(res => {
            console.log(res);
            setIsLoading(false);
            clearComment();
            setRefreshIteration(refreshIteration + 1)
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        });
    }

    function clearComment() {
        setCommentText("");
    }

    return (
        <>
            <div className="up-ui-title mb-4"><span>Comments {data ? `(${data.comments.length})` : ""}</span></div>
            <div className="my-4">
                <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    className="w-full border p-4 rounded-md text-xl"
                    placeholder="Write a comment..."
                />
                <div className="flex mt-2">
                    <div className="ml-auto relative">
                        <button
                            className="up-button text ml-auto mr-4"
                            disabled={commentText.length === 0}
                            onClick={clearComment}
                        >
                            Cancel
                        </button>
                        <button
                            className="up-button primary small"
                            disabled={commentText.length === 0 || isLoading}
                            onClick={postComment}
                        >
                            Post
                        </button>
                        {isLoading && (
                            <div className="up-spinner"/>
                        )}
                    </div>
                </div>
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
                        <div className="ml-2">
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
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}