import mongoose from "mongoose";
import {userModel} from "../models/models";

export function getUpdateRequest(username: string, url: string) {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return userModel.findOne({ "urlName": username, "updates.url": encodeURIComponent(url) });
}

export function getCurrUserRequest(email: string) {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return userModel.findOne({ email: email });
}

export async function getCurrUserFeedRequest(email: string) {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    const userData = await userModel.findOne({ email: email });

    if (userData.following.length === 0) return {userData: userData, feedData: null};

    const feedData = await userModel.find({ "_id": { $in: userData.following}});

    return {userData: userData, feedData: feedData};
}

export async function getDemoFeedRequest() {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return await userModel.find({ "_id": { $in: ["5fbf523741f4a430145ed84e", "5fc19ca2faa0244fe0feb0b5"]}});
}

export async function getProfilesByEmails(emailList: string[]) {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return await userModel.find({ "email": { $in: emailList }});
}