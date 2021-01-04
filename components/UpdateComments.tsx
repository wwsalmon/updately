import React, {useState} from 'react';
import {CommentObj, User} from "../utils/types";
import useSWR from "swr";
import {fetcher} from "../utils/utils";
import axios from "axios";
import {format} from "date-fns";
import Link from "next/link";
import {FiCornerUpRight} from "react-icons/fi";
import UpdateCommentForm from "./UpdateCommentForm";
import UpdateCommentItem from "./UpdateCommentItem";

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
                {data && data.comments.filter(d => !d.parentCommentId).map((comment: CommentObj) => (
                    <div className="mb-8">
                        <UpdateCommentItem
                            comment={comment}
                            users={data.users}
                            userData={userData}
                            refreshIteration={refreshIteration}
                            setRefreshIteration={setRefreshIteration}
                        />
                        <div className="pl-16 mt-4">
                            {data.comments.filter(d => d.parentCommentId === comment._id).map(subComment => (
                                <div className="mb-4">
                                    <UpdateCommentItem
                                        comment={subComment}
                                        users={data.users}
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