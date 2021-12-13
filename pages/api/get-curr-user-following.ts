import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import {getCurrUserFeedRequest, getDemoFeedRequest} from "../../utils/requests";
import mongoose from "mongoose";
import {userModel} from "../../models/models";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);

    const session = await getSession({ req });

    if (!session) return res.status(403);

    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const lookupObj = await userModel.aggregate([
            {$match: {email: session.user.email}},
            {$lookup: {from: "users", foreignField: "_id", localField: "following", as: "followingArr"}}
        ]);

        if (!lookupObj.length) return res.status(404).send("No user found for logged in account");

        const followingArr = lookupObj[0].followingArr;

        res.status(200).json({users: followingArr});
    } catch (e) {
        res.status(500).json({error: e});
    }
}