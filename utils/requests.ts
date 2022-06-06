import * as mongoose from "mongoose";
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
    const updates = await updateModel.aggregate([
        {$match: {"userId": user._id}},
        {$lookup: {from: "users", foreignField: "_id", localField: "mentionedUsers", as: "mentionedUsersArr"}}
    ])
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

    const updates = await updateModel.aggregate([
        {$match: {userId: {$in: [...userData.following, userData._id].map(d => mongoose.Types.ObjectId(d))}}},
        {$sort: {date: -1}},
        {$skip: (+req.query.page - 1) * 20},
        {$limit: 20},
        {$lookup: {from: "users", foreignField: "_id", localField: "userId", as: "userArr"}},
    ]);

    const count = await updateModel.count({ "userId": { $in: userData.following }})

    return {userData: userData, feedData: {
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
    let updates = await updateModel.aggregate([
        {$match: {}},
        {$sort: {date: -1}},
        {$skip: (+req.query.page - 1) * 20},
        {$limit: 20},
        {$lookup: {from: "users", foreignField: "_id", localField: "userId", as: "userArr"}},
    ]);

    const count = await updateModel.count({});

    updates = updates.reduce((a, b) => {
        if (b.userArr[0].private || b.userArr[0].truePrivate) {
            const matchingPrivateIndex = a.findIndex(d => (d.private || d.truePrivate) && (d.date.toString() === b.date.toString()));
            if (matchingPrivateIndex > -1) {
                let newArr = [...a];
                newArr[matchingPrivateIndex] = {private: true, count: a[matchingPrivateIndex].count + 1, date: a[matchingPrivateIndex].date};
                return newArr;
            } else {
                const newArr = [...a, {private: true, count: 1, date: b.date}];
                return newArr;
            }
        }
        return [...a, b];
    }, []);

    return {
        updates: updates,
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
        truePrivate: false,
    });
}