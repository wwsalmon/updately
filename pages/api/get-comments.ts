import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {commentModel} from "../../models/models";

export default async function getCommentsHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);

    try {
        if (Array.isArray(req.query.updateId)) return res.status(500).json({message: "Error: multiple update ids in query"});
        const updateId: string = req.query.updateId;
        if (!updateId) return res.status(500).json({message: "Cannot get profile, no update id given"});

        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const comments = await commentModel.aggregate([
            {$match: {updateId: mongoose.Types.ObjectId(updateId)}},
            {$lookup: {from: "users", foreignField: "_id", localField: "authorId", as: "authorArr"}},
        ]);

        res.status(200).json({comments: comments});
    } catch (e) {
        res.status(500).json({error: e});
    }
}