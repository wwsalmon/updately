import axios from "axios";
import * as mongoose from "mongoose";
import { getSession } from "next-auth/react";
import short from "short-uuid";
import { updateModel, userModel } from "../models/models";
import getLookup from "./getLookup";
import { SortBy, Update, User } from "./types";

export interface GetUpdateRequestResponse {user: User, update: Update & {mentionedUsersArr: User[]}};

export async function getUpdateRequest(username: string, url: string): Promise<GetUpdateRequestResponse | null> {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    let user = await userModel.findOne({ "urlName": username });
    if (user === null) return null;

    const updates = await updateModel.aggregate([
        {$match: {"url": url, "userId": user._id}},
        getLookup("users", "_id", "mentionedUsers", "mentionedUsersArr"),
    ]);

    if (!updates.length) return null;


    return {
        user: user,
        update: updates[0],
    };
}

// Gets updates posted of a specific user
export async function getUpdatesRequest({req}) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    const session = await getSession({req});
    let thisUser = null;
    if (session) {
        thisUser = await userModel.findOne({email: session.user.email});
    };

    // req.query.urlName is the url of the user
    let user = await userModel.findOne({ "urlName": req.query.urlName });

    if (user === null) return null;
    let updates;

    let conditions = { userId: user._id };

    if (!thisUser || thisUser._id.toString() !== user._id.toString() || req.query.filter === "published") conditions["published"] = true;
    else if (thisUser && (thisUser._id.toString() === user._id.toString()) && req.query.filter === "draft") conditions["published"] = false;
    
    if (req.query.filter && !["all", "drafts", "published"].includes(req.query.filter)) conditions["tags"] = req.query.filter;

    // Technically, this is unrobust because it checks for the exact time being 00:00:00.000Z, but all updates have this so :shrug: it works
    // (might break in future if we change how we store dates) 
    if (req.query.date) conditions["date"] = new Date(req.query.date);
    
    const facetStage = {$facet: {
        paginatedResults: [{$skip: (+req.query.page - 1) * 10}, {$limit: 10}],
        totalCount: [{$count: "estimatedDocumentCount"}],
    }};

    if (parseInt(req.query.sortBy) == SortBy.WordCount) {
        updates = await updateModel.aggregate([
            { $match: conditions },
            {
                $addFields: {
                    wordCount: {
                        $size: { $split: ['$body', ' '] },
                    },
                },
            },
            { $sort: { wordCount: -1, date: -1, _id: 1 } },
            {$project: {"wordCount": 0}},
            facetStage,
        ]);
    }
    else {
        updates = await updateModel.aggregate([
            { $match: conditions },
            { $sort: { date: -1 } },
            facetStage,
        ]);
    }

    return updates;
}


export async function getCurrUserRequest(email: string) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return userModel.findOne({ email: email });
}

export async function getUserByEmail(email: string): Promise<User> {
	await mongoose.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});

	return userModel.findOne({ email: email });
}

export async function getUserById(userId: string): Promise<User> {
	await mongoose.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});

	return userModel.findOne({ _id: userId });
}

export async function getUserByUsername(username: string): Promise<User> {
	await mongoose.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});

	return userModel.findOne({ urlName: username });
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
        {$match: {published: true, userId: {$in: [...userData.following, userData._id].map(d => mongoose.Types.ObjectId(d))}}},
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

    let updates = await updateModel.aggregate([
        {$match: {published: true}},
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