import React, {useState} from 'react';
import axios from "axios";
import {User} from "../utils/types";

export default function UpdateCommentForm({updateId, userData, parentCommentId = null, callback, onCancel}: {
    updateId: string,
    userData: User,
    parentCommentId?: string,
    callback: () => any,
    onCancel: () => any,
}) {
    const [commentText, setCommentText] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function postComment() {
        setIsLoading(true);

        axios.post("/api/new-comment", {
            commentText: commentText,
            authorId: userData._id,
            updateId: updateId,
            commentId: parentCommentId,
        }).then(res => {
            console.log(res);
            setIsLoading(false);
            clearComment();
            callback();
        }).catch(e => {
            console.log(e);
            setIsLoading(false);
        });
    }

    function clearComment() {
        setCommentText("");
        onCancel();
    }

    return (
        <>
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
        </>
    );
}