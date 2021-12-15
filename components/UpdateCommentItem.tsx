import React, {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import {CommentItem, CommentObj, LikeItem, Update, User} from "../utils/types";
import Link from "next/link";
import {format} from "date-fns";
import {FiCornerUpRight, FiHeart, FiTrash} from "react-icons/fi";
import UpdateCommentForm from "./UpdateCommentForm";
import axios from "axios";
import useSWR, {responseInterface} from "swr";
import {escapeRegExp, fetcher} from "../utils/utils";
import {useRouter} from "next/router";
import {useSession} from "next-auth/client";
import UserPfpList from "./UserPfpList";
import {getMentionInfo} from "../pages/api/update";

export function getMentionsAndBodySegments(body: string) {
    const {mentionStrings, mentionObjs} = getMentionInfo(body);
    const regexString = mentionStrings ? mentionStrings.map(d => `\\@\\[${escapeRegExp(d)}\\)`).join("|") : null;
    const bodySegments = mentionStrings ? body.split(new RegExp(regexString)) : [];
    return {bodySegments: bodySegments, mentionObjs: mentionObjs};
}

const CommentBody = ({comment, mentionedUsers}: {comment: CommentObj, mentionedUsers: User[]}) => {
    const {bodySegments, mentionObjs} = getMentionsAndBodySegments(comment.body);

    return (
        <p className="sm:text-xl">
            {(mentionObjs && mentionObjs.length) ? bodySegments.map((segment, i) => (
                <React.Fragment key={`comment-${comment._id}-fragment-${i}`}>
                    {segment}
                    {i !== bodySegments.length - 1 && (
                        <Link href={`/@${mentionedUsers.find(d => d._id === mentionObjs[i].id).urlName}`}>
                            <a className="bg-gray-100 border-b-2 border-black">
                                @{mentionObjs[i].display}
                            </a>
                        </Link>
                    )}
                </React.Fragment>
            )) : comment.body}
        </p>
    );
}

export default function UpdateCommentItem({comment, mentionedUsers, update, userData, refreshIteration, setRefreshIteration}: {
    comment: CommentItem,
    mentionedUsers: User[],
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
        axios.delete("/api/comment", {
            data: {
                commentId: comment._id,
            }
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
                <CommentBody comment={comment} mentionedUsers={mentionedUsers}/>
                <div className="flex mt-2 items-center">
                    <button
                        className={`opacity-25 inline-flex items-center ${replyOpen ? "cursor-default" : "hover:opacity-75"}`}
                        onClick={() => setReplyOpen(true)}
                        disabled={replyOpen}
                    >
                        <FiCornerUpRight/>
                        <span className="ml-2">{replyOpen ? "Replying" : "Reply"}</span>
                    </button>
                    {userData && (commentAuthor._id === userData._id || update.userId === userData._id) && (confirmDelete ? (
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
                    ))}
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