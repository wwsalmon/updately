import React, {useState} from 'react';
import axios from "axios";
import {Update, User} from "../utils/types";
import { MentionsInput, Mention } from "react-mentions";

export default function UpdateCommentForm({update, userData, parentCommentId = null, callback, onCancel}: {
    update: Update,
    userData: User,
    parentCommentId?: string,
    callback: () => any,
    onCancel: () => any,
}) {
    const [commentText, setCommentText] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function postComment() {
        setIsLoading(true);

        axios.post("/api/comment", {
            commentText: commentText,
            authorId: userData._id,
            updateId: update._id,
            updateAuthorId: update.userId,
            commentId: parentCommentId,
        }).then(res => {
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

    function getMentionUsers(query, callback) {
        if (!query) return;

        axios.get(`/api/search-user?s=${query}`)
            .then(res => {
                callback(res.data.results.map(d => ({display: d.name, id: d._id})))
            });
    }

    return (
        <>
            <MentionsInput
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="w-full border p-4 rounded-md text-xl up-mention-input"
                placeholder="Write a comment..."
                style={{
                    suggestions: {
                        list: {
                            padding: "8px 0",
                            fontSize: 16,
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", // shadow-lg
                            borderRadius: "0.375rem", // rounded-md
                        },
                        item: {
                            padding: "8px 12px",
                            "&focused": {
                                backgroundColor: "rgb(243 244 246)", // gray 100
                            }
                        }
                    }
                }}
            >
                <Mention
                    trigger="@"
                    displayTransform={(id, display) => `@${display}`}
                    data={getMentionUsers}
                    className="border-b-2 border-black bg-gray-100"
                />
            </MentionsInput>
            <div className="flex mt-2">
                <div className="ml-auto relative">
                    <button
                        className="up-button text ml-auto mr-4"
                        disabled={!parentCommentId && commentText.length === 0}
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