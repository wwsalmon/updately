import React, {useState} from 'react';
import {CommentItem, CommentObj, Update, User} from "../utils/types";
import useSWR, {responseInterface} from "swr";
import {fetcher} from "../utils/utils";
import UpdateCommentForm from "./UpdateCommentForm";
import UpdateCommentItem from "./UpdateCommentItem";

export default function UpdateComments({update, userData}: { update: Update, userData: User }) {
    const [refreshIteration, setRefreshIteration] = useState<number>(0);
    const {data, error}: responseInterface<{comments: CommentItem[], mentionedUsers: User[]}, any> = useSWR(`/api/get-comments?updateId=${update._id}&?iter=${refreshIteration}`, fetcher);

    return (
        <>
            <div className="up-ui-title mb-4 dark:text-gray-300"><span>Comments {data ? `(${data.comments.length})` : ""}</span></div>
            <div className="my-4">
                <UpdateCommentForm
                    update={update}
                    userData={userData}
                    callback={() => setRefreshIteration(refreshIteration + 1)}
                    onCancel={() => null}
                />
            </div>
            <div className="my-4">
                {data && data.comments.filter(d => !d.parentCommentId).map(comment => (
                    <div className="mb-12" key={`comment-${comment._id}`}>
                        <UpdateCommentItem
                            comment={comment}
                            mentionedUsers={data.mentionedUsers}
                            update={update}
                            userData={userData}
                            refreshIteration={refreshIteration}
                            setRefreshIteration={setRefreshIteration}
                        />
                        <div className="pl-16 mt-6">
                            {data.comments.filter(d => d.parentCommentId === comment._id).map(subComment => (
                                <div className="mb-6">
                                    <UpdateCommentItem
                                        comment={subComment}
                                        mentionedUsers={data.mentionedUsers}
                                        update={update}
                                        userData={userData}
                                        refreshIteration={refreshIteration}
                                        setRefreshIteration={setRefreshIteration}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}