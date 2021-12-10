import mongoose, {Model, Schema} from "mongoose";
import {LikeDoc, MentionDoc, NotificationDoc} from "../utils/types";

const reqString = {
    type: String,
    required: true,
};

const unreqString = {
    type: String,
    required: false,
};

const authorObj = {
    name: reqString,
    image: reqString,
    email: { ...reqString, unique: true },
    urlName: { ...unreqString, unique: true, },
    bio: unreqString,
    linkedin: unreqString,
    twitter: unreqString,
    website: unreqString,
};

const commentSchema: Schema = new Schema({
    authorId: mongoose.Schema.Types.ObjectId,
    updateId: mongoose.Schema.Types.ObjectId,
    body: reqString,
    isSubComment: {type: Boolean, required: true},
    parentCommentId: mongoose.Schema.Types.ObjectId,
}, {
    timestamps: true,
});

// this is also legacy. TODO: figure out how to remove this
const updateSchema: Schema = new Schema({
    body: reqString,
    url: reqString,
    title: unreqString,
    date: Date,
    readBy:  [mongoose.Schema.Types.ObjectId],
}, {
    timestamps: true,
});

const updateV2Schema: Schema = new Schema({
    userId: mongoose.Schema.Types.ObjectId,
    body: reqString,
    url: reqString,
    title: unreqString,
    date: Date,
    readBy:  [mongoose.Schema.Types.ObjectId],
    comments: [commentSchema],
}, {
    timestamps: true,
});

const userSchema: Schema = new Schema({
    ...authorObj,
    private: {type: Boolean, required: true},
    updates: [updateSchema], // legacy, I'm assuming? TODO: fully deprecate and remove this
    following:  [mongoose.Schema.Types.ObjectId],
    followers: [reqString], // emails of followers
    requests: [reqString], // emails of users requesting follows
    requesting:  [mongoose.Schema.Types.ObjectId],
    template: unreqString,
}, {
    timestamps: true,
});

const notificationSchema: Schema = new Schema({
    userId: mongoose.Schema.Types.ObjectId, // ID of receiving user
    authorId: mongoose.Schema.Types.ObjectId, // ID of comment author
    updateId: mongoose.Schema.Types.ObjectId, // ID of update of comment to generate link and notification message
    commentId: {type: mongoose.Schema.Types.ObjectId, required: false}, // ID of the comment for likeComment
    type: reqString, // "comment" | "reply" | "follow" | "request"
    read: {type: Boolean, required: true},
}, {
    timestamps: true,
});

const likeSchema: Schema = new Schema({
    userId: mongoose.Schema.Types.ObjectId, // ID of giving user
    updateId: mongoose.Schema.Types.ObjectId, // ID of update or comment. TODO: change this to 'nodeId' eventually
});

const mentionSchema: Schema = new Schema({
    userId: mongoose.Schema.Types.ObjectId, // ID of giving user
    nodeId: mongoose.Schema.Types.ObjectId, // ID of update or comment
})

export const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export const updateModel = mongoose.models.update || mongoose.model("update", updateV2Schema);
export const commentModel = mongoose.models.comment || mongoose.model("comment", commentSchema);
export const notificationModel: Model<NotificationDoc> = mongoose.models.notification || mongoose.model("notification", notificationSchema);
export const likeModel: Model<LikeDoc> = mongoose.models.like || mongoose.model("like", likeSchema);
export const mentionModel: Model<MentionDoc> = mongoose.models.mention || mongoose.model("mention", mentionSchema);