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

    let user = await userModel.findOne({ "urlName": username });
    if (user === null) return null;
    const updates = await updateModel.find({ "userId": user._id });
    if (!updates.some(d => d.url === encodeURIComponent(url))) return null;

    return {
        user: user,
        updates: updates,
    };
}

export async function getUpdatesRequest({req}) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    
    let user = await userModel.findOne({ "urlName": req.query.urlName });
    if (user === null) return null;
    let updates;

    req.query.updatePage ? updates = await updateModel.find({ "userId": user._id }).sort('-date').limit(10*req.query.page) : updates = await updateModel.find({ "userId": user._id }).sort('-date').skip((+req.query.page - 1) * 10).limit(10);  

    return {
        user: user,
        updates: updates,
    };
}

export async function getCurrUserRequest(email: string) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return userModel.findOne({ email: email });
}

export async function getCurrUserFeedRequest(user, req) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    let userData = await userModel.findOne({ email: user.email });

    if (!userData) userData = await createAccount(user);

    if (userData.following.length === 0) return {userData: userData, feedData: null};

    const users = await userModel.find({ "_id": { $in: userData.following}});
    const updates = await updateModel.find({ "userId": { $in: userData.following }}).sort('-date').skip((+req.query.page - 1) * 10).limit(10); 
    const count = await updateModel.count({ "userId": { $in: userData.following }})
    return {userData: userData, feedData: {
        users: users,
        updates: updates,
        count: count
    }};
}

export async function getDemoFeedRequest({ req }) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    // Only get the updates where their corresponding user has a public account.
    const publicUsers = await userModel.find({ private: false});
    let publicUserIds = [];
    for (let user of publicUsers) {
        publicUserIds.push(user._id)
    }
    const updates = await updateModel.aggregate([
        {$match: {"userId": { $in: publicUserIds }}},
        {$sort: {date: -1}},
        {$skip: (+req.query.page - 1) * 10},
        {$limit: 10}
    ])
    const count = await updateModel.count({"userId": { $in: publicUserIds }})
    
    // let userIds = [];
    // for (let update of updates) {
    //     if (!userIds.includes(update.userId)) userIds.push(update.userId);
    // }

    const users = await userModel.find();

    return {
        updates: updates,
        users: users,
        count: count,
    };
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

export async function getProfilesByIds(idList: string[]){
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return userModel.aggregate([
        {$match: {_id: { $in: idList }}},
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