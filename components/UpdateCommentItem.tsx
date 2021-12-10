import React, {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';
import {CommentItem, CommentObj, DatedObj, LikeItem, LikeObj, Update, User} from "../utils/types";
import Link from "next/link";
import {format} from "date-fns";
import {FiCornerUpRight, FiHeart, FiTrash} from "react-icons/fi";
import UpdateCommentForm from "./UpdateCommentForm";
import axios from "axios";
import useSWR, {responseInterface} from "swr";
import {fetcher} from "../utils/utils";
import {useRouter} from "next/router";
import {useSession} from "next-auth/client";
import UserPfpList from "./UserPfpList";

export default function UpdateCommentItem({comment, update, userData, refreshIteration, setRefreshIteration}: {
    comment: CommentItem,
    update: Update,
    userData: User,
    refreshIteration: number,
    setRefreshIteration: Dispatch<SetStateAction<number>>,
}) {
    const router = useRouter();
    const [session, loading] = useSession();

    const [replyOpen, setReplyOpen] = useState<boolean>(false);
    const [likesIter, setLikesIter] = useState<number>(0);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const confirmDeleteRef = useRef<HTMLButtonElement>(null);

    const {data: likesData, error: likesError}: responseInterface<{ likes: LikeItem[] }, any> = useSWR(`/api/like?commentId=${comment._id}&iter=${likesIter}`, fetcher);

    const isLike = likesData && likesData.likes && userData && !!likesData.likes.find(d => d.userId === userData._id);

    const commentAuthor = comment.authorArr[0];

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

    function onPressLike() {
        if (!session) return router.push("/sign-in");

        if (!(likesData && likesData.likes)) return;

        const isLike = !!likesData.likes.find(d => d.userId === userData._id);

        if (isLike) {
            axios
                .delete("/api/like", {data: {commentId: comment._id}})
                .then(() => setLikesIter(likesIter + 1));
        } else {
            axios
                .post("/api/like", {commentId: comment._id})
                .then(() => setLikesIter(likesIter + 1));
        }
    }

    return (
        <div className="flex">
            <Link href={`/@${commentAuthor.urlName}`}>
                <a>
                    <img
                        src={commentAuthor.image}
                        alt={`Profile picture of ${commentAuthor.name}`}
                        className="w-10 h-10 rounded-full mr-4 mt-2"
                    />
                </a>
            </Link>
            <div className="ml-2 w-full break-words overflow-hidden">
                <p>
                    <Link href={`/@${commentAuthor.urlName}`}>
                        <a>
                            <b>{commentAuthor.name}</b>
                        </a>
                    </Link>
                    <span className="opacity-50 ml-4">
                        {format(new Date(comment.createdAt), "M/d/yyyy 'at' h:mm a")}
                    </span>
                </p>
                <p className="sm:text-xl">{comment.body}</p>
                <div className="flex mt-2 items-center">
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
                    <button
                        className="opacity-25 inline-flex items-center hover:opacity-75 ml-8"
                        onClick={onPressLike}
                        disabled={!(likesData && likesData.likes)}
                    >
                        {isLike ? (
                            <FiHeart color="red"/>
                        ) : (
                            <FiHeart/>
                        )}
                        <span className="ml-2">{(likesData && likesData.likes) ? (likesData.likes.length || "") : "Loading..."}</span>
                    </button>
                    {likesData && likesData.likes && !!likesData.likes.length && (
                        <div className="ml-4">
                            <UserPfpList userList={likesData.likes.map(d => d.userArr[0])} isSmall={true}/>
                        </div>
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