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