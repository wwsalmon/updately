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

const commentObj = {
    authorId: ObjectId,
    author: authorObj,
    updateId: ObjectId,
    body: reqString,
};

const subCommentSchema: Schema = new Schema({
    ...commentObj,
}, {
    timestamps: true,
});

const commentSchema: Schema = new Schema({
    ...commentObj,
    subComments: [subCommentSchema],
}, {
    timestamps: true,
});

const updateSchema: Schema = new Schema({
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

export const userModel = mongoose.models.user || mongoose.model('user', userSchema);