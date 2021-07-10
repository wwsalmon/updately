import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {userModel} from "../../models/models";

export default async function editBioHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);
    
    const session = await getSession({ req });
    
    let followerIds = ["f"];

    if (!session) return res.status(404).json({message: "You must be signed in to fetch followers."})
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    const thisUser = await userModel.aggregate([
        {$match: {email: session.user.email}},
        {$lookup: {
            from: "users",
            let: {"followers": "$followers"},
            pipeline: [
                {$match: {$expr: {$and: [
                    {$in: ["$email", "$$followers"]},
                ]}}}
            ],
            as: "followerArr",
        }}
    ])

    for (let follower of thisUser[0].followerArr) {
        followerIds.push(follower._id)
    }
    thisUser[0].followerIds = followerIds
    
    return res.status(200).json({ data: thisUser[0] });
}