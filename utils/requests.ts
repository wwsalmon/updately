import * as mongoose from "mongoose";
import {embeddingModel, updateModel, userModel} from "../models/models";
import short from "short-uuid";
import axios from "axios";
import cohere from "cohere-ai"
import {getSession} from "next-auth/react";
import { SortBy, Update } from "./types";
import { NextApiRequest } from "next";
// import { dot, norm } from "mathjs";

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

    if (!thisUser || thisUser._id.toString() !== user._id.toString()) conditions["published"] = true;

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
            { $skip: (+req.query.page - 1) * 10 },
            { $limit: 10 },
        ]);
    }
    else {
        updates = await updateModel.find(conditions).sort('-date').skip((+req.query.page - 1) * 10).limit(10);
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


// async function getUserUpdates (userId: string) {
//     await mongoose.connect(process.env.MONGODB_URL, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         useFindAndModify: false,
//     });
//     let user = await userModel.findOne({ "urlName": username })
//     if (user === null) return null;
    
//     const updates: Update[] = await updateModel.find({
//         userId : user._id,
//         published: true
//     })
//     return updates
// }

export async function generateUserEmbeddings (updates: Update[]) {
    cohere.init(process.env.COHERE_KEY)
    const response = await cohere.embed({
        texts: updates.map(update => update.body),
        truncate: "RIGHT"
    });
    return response.body.embeddings
}

export async function generateEmbedding(text:string) {
    cohere.init(process.env.COHERE_KEY)
    const response = await cohere.embed({
        texts: [text],
        truncate: "RIGHT"
    })
    return response.body.embeddings[0]
}


async function getUpdate (url: string) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    const update: Update = await updateModel.findOne({
        url: url
    });
    return update
}

async function getUserEmbeddings(userId: string) {
	await mongoose.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});
	const updatesWithEmbeddings: (Update & { embedding: number[] })[] =
		await updateModel.aggregate([
			{ $match: { userId: mongoose.Types.ObjectId(userId) } },
			{
				$lookup: {
					from: 'embeddings',
					localField: '_id',
					foreignField: 'updateId',
					as: 'fromEmbeddings',
				},
			},
			{ $match: { fromEmbeddings: { $ne: [] } } },
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: [{ $arrayElemAt: ['$fromEmbeddings', 0] }, '$$ROOT'],
					},
				},
			},
			{ $project: { fromEmbeddings: 0 } },
		]);
	const updatesWithoutEmbeddings = await updateModel.aggregate([
		{ $match: { userId: mongoose.Types.ObjectId(userId) } },
		{
			$lookup: {
				from: 'embeddings',
				localField: '_id',
				foreignField: 'updateId',
				as: 'fromEmbeddings',
			},
		},
		{ $match: { fromEmbeddings: { $eq: [] } } },
		{ $project: { fromEmbeddings: 0 } },
	]);
	console.log(updatesWithoutEmbeddings.map(update => update.title));
	if (updatesWithoutEmbeddings.length != 0) {
		console.log('cache misses: recomputing embeddings');
		const embeddings = await generateUserEmbeddings(updatesWithoutEmbeddings);
		console.log(embeddings[0]);
		console.log('computed embeddings from cohere');
		await embeddingModel.insertMany(
			embeddings.map((embedding, index) => ({
				updateId: mongoose.Types.ObjectId(updatesWithoutEmbeddings[index]._id),
				embedding: embedding,
			})),
			error => {
				throw new Error(error);
			}
		);

		updatesWithEmbeddings.push(
			...updatesWithoutEmbeddings.map((update, index) => ({
				embedding: embeddings[index],
				...update,
			}))
		);
	}
	// console.log(updatesWithEmbeddings)
	return updatesWithEmbeddings;
}


export function semanticSimilarity(a: number[], b: number[]) {
	const dot = (a: Float64Array, b: Float64Array) =>
		a.reduce((prev, curr, index) => prev + curr * b[index]);

	const norm = (x: Float64Array) =>
		Math.sqrt(x.reduce((prev, curr) => prev + curr * curr));

	const aEmbed = new Float64Array(a);
	const bEmbed = new Float64Array(b);
	return dot(aEmbed, bEmbed) / (norm(aEmbed) * norm(bEmbed));
}

export async function getTopThree(userId: string, updateId: string) {
	console.log('GETTING TOP THREE');
	cohere.init(process.env.COHERE_KEY);
	await mongoose.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});

	const update = await updateModel.findById(updateId);
	const updatesWithEmbeddings = await getUserEmbeddings(userId);
	const embedding = await embeddingModel.findOne({
		updateId: update._id,
	});
	console.log('got embeddings');

	console.time('computing similarity');
	const similarities = updatesWithEmbeddings.map((x): [Update, number] => [
		x,
		semanticSimilarity(x.embedding, embedding.embedding),
	]);
	console.timeEnd('computing similarity');
	console.time('sorting');
	const sortedSimilarities = similarities.sort((a, b) => b[1] - a[1]);
	console.timeEnd('sorting');
	// console.log(sortedSimilarities.map(x => `title: ${x[0].title} similarity: ${x[1]}`))
	return sortedSimilarities.map(x => x[0]).slice(1, 4);
}