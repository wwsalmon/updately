import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {userModel} from "../../models/models";

export default async function searchUserHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({message: "Method not allowed"});

    const { query: { s } } = req;

    // if empty string, return empty array
    if (!s) return res.status(200).json({results: []});

    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const results = await userModel.aggregate([
            {$match: {"name": {$regex: `.*${s}.*`, $options: "i"}}},
            {$limit: 10},
            {$group: {_id: "$_id", name: {$first: "$name"}, image: {$first: "$image"}, urlName: {$first: "$urlName"}}}
        ]);

        res.status(200).json({results: results});
    } catch (e) {
        res.status(500).json({error: e});
    }
}