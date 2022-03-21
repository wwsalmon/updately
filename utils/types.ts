import {Document} from "mongoose";

export type DatedObj<T extends {}> = T & {
    _id: string,
    createdAt: string, // ISO date
    updatedAt: string, // ISO date
}

export interface User {
    _id: string,
    createdAt: string, // date string
    name: string,
    email: string,
    followers: string[], // emails
    following: string[], // ids
    image: string,
    private: boolean,
    truePrivate: boolean,
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
    mentionedUsers: string[], // ids
}

export interface PrivateAggregation {
    private: true,
    date: string, // date string
    count: number,
}

export type FeedItem = (DatedObj<Update> & {userArr: DatedObj<User>[]}) | PrivateAggregation;

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

export type CommentItem = CommentObj & {authorArr: DatedObj<User>[]};

export type NotificationTypeOpts = "comment" | "reply" | "follow" | "request" | "like" | "likeComment" | "mentionUpdate" | "mentionComment";

export interface NotificationObj {
    userId: string,
    authorId: string,
    updateId: string,
    commentId?: string,
    type: NotificationTypeOpts,
    read: boolean,
}

export type NotificationDoc = NotificationObj & Document;

export type RichNotif = DatedObj<NotificationObj> & {
    authorArr: User[],
    updateArr: (Update & {userArr: User[]})[],
};

export interface LikeObj {
    userId: string,
    updateId: string,
}

export type LikeDoc = LikeObj & Document;

export interface MentionObj {
    userId: string,
    updateId: string,
}

export type MentionDoc = MentionObj & Document;

export type LikeItem = LikeObj & {userArr: User[]};