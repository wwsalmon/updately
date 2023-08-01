import mongoose, {Model, Schema} from "mongoose";
import {LikeDoc, NotificationDoc} from "../utils/types";

// workaround to get empty strings to be recognized as valid string values from https://github.com/Automattic/mongoose/issues/7150
const Str = mongoose.Schema.Types.String as any;
Str.checkRequired(v => v != null);

const reqString = {
    type: String,
    required: true,
};

const unreqString = {
    type: String,
    required: false,
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

const updateSchema: Schema = new Schema({
    userId: mongoose.Schema.Types.ObjectId,
    body: reqString,
    url: unreqString, // required only for published updates
    title: reqString, // the field is always there but it is an empty string on untitled updates
    date: Date,
    comments: [commentSchema],
    mentionedUsers: [mongoose.Schema.Types.ObjectId],
    published: {type: Boolean, required: true},
    tags: [String],
}, {
    timestamps: true,
});

const userSchema: Schema = new Schema({
    name: reqString,
    image: reqString,
    email: { ...reqString, unique: true },
    urlName: { ...reqString, unique: true, },
    bio: unreqString,
    private: {type: Boolean, required: true},
    truePrivate: {type: Boolean, required: true},
    following:  [mongoose.Schema.Types.ObjectId],
    followers: [reqString], // emails of followers
    requests: [reqString], // emails of users requesting follows
    requesting:  [mongoose.Schema.Types.ObjectId],
    template: unreqString,
    tags: [String],
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
}, {
    timestamps: true,
});

export const userModel = (!!mongoose.models && mongoose.models.user) || mongoose.model("user", userSchema);
export const updateModel = (!!mongoose.models && mongoose.models.update) || mongoose.model("update", updateSchema);
export const commentModel = (!!mongoose.models && mongoose.models.comment) || mongoose.model("comment", commentSchema);
export const notificationModel: Model<NotificationDoc> = (!!mongoose.models && mongoose.models.notification) || mongoose.model("notification", notificationSchema);
export const likeModel: Model<LikeDoc> = (!!mongoose.models && mongoose.models.like) || mongoose.model("like", likeSchema);