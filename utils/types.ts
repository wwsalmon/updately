import {Document} from "mongoose";

export interface User {
    _id: string,
    createdAt: string, // date string
    name: string,
    email: string,
    followers: string[], // emails
    following: string[], // ids
    image: string,
    private: boolean,
    requesting: string[],
    requests: [],
    updatedAt: string, // date string,
    urlName: string,
    bio: string,
    template: string,
}

export interface Update {
    _id: string,
    readBy: string[],
    date: string, // date string
    body: string,
    url: string,
    title: string,
    userId: string, // id
    comments: any[],
    createdAt: string, // date string
    updatedAt: string, // date string
}

export interface CommentObj {
    _id: string,
    authorId: string,
    updateId: string,
    body: string,
    isSubComment: boolean,
    parentCommentId: string,
    createdAt: string, // date string
    updatedAt: string, // date string
}

export interface Notification extends Document {
    _id: string,
    userId: string,
    authorId: string,
    updateId: string,
    type: "comment" | "reply" | "follow" | "request",
    read: boolean,
    createdAt: string, // date string
    updatedAt: string, // date string
}