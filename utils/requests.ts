import mongoose from "mongoose";
import {updateModel, userModel} from "../models/models";
import short from "short-uuid";
import axios from "axios";

export async function getUpdateRequest(username: string, url: string) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    let updateUser = await userModel.findOne({ "urlName": username });

    if (updateUser === null) return updateUser;

    const updateV2s = await updateModel.find({ "userId": updateUser.id });

    updateUser.updates.push.apply(updateUser.updates, updateV2s);

    if (!updateUser.updates.some(d => d.url === url)) return null;

    return updateUser;
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

    let followingUsers = await userModel.find({ "_id": { $in: userData.following}});
    let followingUserUpdates = await updateModel.find({ "userId": { $in: userData.following }});
    for (let update of followingUserUpdates) {
        const userIndex = followingUsers.findIndex(d => d.id.toString() === update.userId.toString());
        followingUsers[userIndex].updates.push(update);
    }
    return {userData: userData, feedData: followingUsers};
}

export async function getDemoFeedRequest() {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    let retval = [];

    for (let id of ["5fbf523741f4a430145ed84e", "5fc1e19db231d6000811ec5d"]) {
        let userData = await userModel.findOne({ "_id": id });
        const userUpdates = await updateModel.find({ "userId": id });
        userData.updates.push.apply(userData.updates, userUpdates);
        retval.push(userData);
    }

    return retval;
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