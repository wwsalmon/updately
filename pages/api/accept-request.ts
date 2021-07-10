import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {userModel} from "../../models/models";

export default async function editBioHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405);
    const session = await getSession({ req });
    if (!session) {
        res.status(403).json({message: "You must be signed in to edit a user profile."});
        return;
    }
    if (!req.body.requesterId || !req.body.receivingUserId) return res.status(422).json({message: "No user and author ID in request"});

    try {
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const requester = await userModel.findById(req.body.requesterId);
        const receivingUser = await userModel.findById(req.body.receivingUserId);

        if (!requester) return res.status(500).json({message: "No user found for given ID"});
        if (!receivingUser) return res.status(500).json({message: "No user found for given ID"});
        if (receivingUser.email !== session.user.email) return res.status(403).json({message: "You do not have permission to accept this follow request."});

        requester.following.push(req.body.receivingUserId);
        receivingUser.followers.push(requester.email);
        requester.requesting = requester.requesting.filter(d => !d.equals(req.body.requesterId));
        receivingUser.requests = receivingUser.requests.filter(d => d !== requester.email);

        requester.markModified("requesting", "following");
        receivingUser.markModified("requests", "followers");

        await requester.save();
        await receivingUser.save();

        res.status(200).json({message: "success", userData: receivingUser});
    } catch (e) {
        res.status(500).json({error: e});
    }
}