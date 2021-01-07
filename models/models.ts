import mongoose, { Schema, ObjectId } from "mongoose";

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
    authorId: ObjectId,
    updateId: ObjectId,
    body: reqString,
    isSubComment: {type: Boolean, required: true},
    parentCommentId: ObjectId,
}, {
    timestamps: true,
});

const updateSchema: Schema = new Schema({
    body: reqString,
    url: reqString,
    title: unreqString,
    date: Date,
    readBy: [ObjectId],
}, {
    timestamps: true,
});

const updateV2Schema: Schema = new Schema({
    userId: ObjectId,
    body: reqString,
    url: reqString,
    title: unreqString,
    date: Date,
    readBy: [ObjectId],
    comments: [commentSchema],
}, {
    timestamps: true,
});

const userSchema: Schema = new Schema({
    ...authorObj,
    private: {type: Boolean, required: true},
    updates: [updateSchema],
    following: [ObjectId],
    followers: [reqString], // emails of followers
    requests: [reqString], // emails of users requesting follows
    requesting: [ObjectId],
}, {
    timestamps: true,
});

const notificationSchema: Schema = new Schema({
    userId: ObjectId, // ID of receiving user
    authorId: ObjectId, // ID of comment author
    updateId: ObjectId, // ID of update of comment to generate link and notification message
    type: reqString, // "comment" | "reply"
    read: {type: Boolean, required: true},
}, {
    timestamps: true,
});

export const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export const updateModel = mongoose.models.update || mongoose.model('update', updateV2Schema);
export const commentModel = mongoose.models.comment || mongoose.model('comment', commentSchema);
export const notificationModel = mongoose.models.notification || mongoose.model('notification', notificationSchema);