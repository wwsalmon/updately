import React, {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';
import {CommentObj, Update, User} from "../utils/types";
import Link from "next/link";
import {format} from "date-fns";
import {FiCornerUpRight, FiTrash} from "react-icons/fi";
import UpdateCommentForm from "./UpdateCommentForm";
import axios from "axios";

export default function UpdateCommentItem({comment, update, users, userData, refreshIteration, setRefreshIteration}: {
    comment: CommentObj,
    update: Update,
    users: User[],
    userData: User,
    refreshIteration: number,
    setRefreshIteration: Dispatch<SetStateAction<number>>,
}) {
    const [replyOpen, setReplyOpen] = useState<boolean>(false);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const confirmDeleteRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        function cancelDelete(e) {
            if (confirmDeleteRef.current && !confirmDeleteRef.current.contains(e.target)) setConfirmDelete(false);
        }

        document.addEventListener("mousedown", cancelDelete);

        return () => {
            document.removeEventListener("mousedown", cancelDelete);
        };
    }, [confirmDeleteRef]);

    function onDelete() {
        axios.post("/api/delete-comment", {
            commentId: comment._id,
        }).then(() => {
            setRefreshIteration(refreshIteration + 1);
        }).catch(e => {
            console.log(e);
        })
    }

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
                <div className="flex mt-2">
                    <button
                        className={`opacity-25 inline-flex items-center ${replyOpen ? "cursor-default" : "hover:opacity-75"}`}
                        onClick={() => setReplyOpen(true)}
                        disabled={replyOpen}
                    >
                        <FiCornerUpRight/>
                        <span className="ml-2">{replyOpen ? "Replying" : "Reply"}</span>
                    </button>
                    {confirmDelete ? (
                        <button
                            className="opacity-75 inline-flex items-center hover:opacity-100 ml-8 text-red-400"
                            ref={confirmDeleteRef}
                            onClick={onDelete}
                        >
                            <FiTrash/>
                            <span className="ml-2">Are you sure you want to delete this comment?</span>
                        </button>
                    ) : (
                        <button
                            className="opacity-25 inline-flex items-center hover:opacity-75 ml-8"
                            onClick={() => setConfirmDelete(true)}
                        >
                            <FiTrash/>
                            <span className="ml-2">Delete</span>
                        </button>
                    )}
                </div>
                {replyOpen && (
                    <div className="my-4">
                        <UpdateCommentForm
                            update={update}
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