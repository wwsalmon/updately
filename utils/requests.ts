import mongoose from "mongoose";
import {userModel} from "../models/models";
import short from "short-uuid";
import axios from "axios";

export async function getUpdateRequest(username: string, url: string) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return userModel.findOne({ "urlName": username, "updates.url": encodeURIComponent(url) });
}

export async function getCurrUserRequest(email: string) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return userModel.findOne({ email: email });
}

export async function getCurrUserFeedRequest(user) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    let userData = await userModel.findOne({ email: user.email });

    if (!userData) userData = await createAccount(user);

    if (userData.following.length === 0) return {userData: userData, feedData: null};

    const feedData = await userModel.find({ "_id": { $in: userData.following}});

    return {userData: userData, feedData: feedData};
}

export async function getDemoFeedRequest() {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return userModel.find({ "_id": { $in: ["5fbf523741f4a430145ed84e", "5fc1e19db231d6000811ec5d"]}});
}

export async function getProfilesByEmails(emailList: string[]) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return userModel.aggregate([
        {$match: {"email": { $in: emailList }}},
        {$group: {_id: "$_id", name: {$first: "$name"}, image: {$first: "$image"}, urlName: {$first: "$urlName"}}}
    ]);
}

export async function createAccount(user) {
    await axios.post(`https://api.mailerlite.com/api/v2/groups/${process.env.MAILERLITE_GROUP_ID}/subscribers`, {
        email: user.email,
        name: user.name,
    }, {
        headers: {
            "X-MailerLite-ApiKey": process.env.MAILERLITE_KEY,
            "Content-Type": "application/json",
        }
    });

    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    const urlName = user.name.split(" ").join("-") + "-" + short.generate();

    return userModel.create({
        email: user.email,
        name: user.name,
        image: user.image,
        urlName: urlName,
        private: false,
    });
}