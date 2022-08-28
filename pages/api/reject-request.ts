import {getSession} from "next-auth/react";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {notificationModel, userModel} from "../../models/models";

export default async function editBioHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405);
    const session = await getSession({ req });
    if (!session) {
        res.status(403).json({message: "You must be signed in to edit a user profile."});
        return;
    }
    if (!req.body.notificationId) return res.status(422).json({message: "No notification ID in request"});

    try {
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const notification = await notificationModel.findById(req.body.notificationId)

        const requester = await userModel.findById(notification.authorId);
        const receivingUser = await userModel.findById(notification.userId);

        if (!requester) return res.status(500).json({message: "No user found for given ID"});
        if (!receivingUser) return res.status(500).json({message: "No user found for given ID"});
        if (receivingUser.email !== session.user.email) return res.status(403).json({message: "You do not have permission to accept this follow request."});

        requester.requesting = requester.requesting.filter(d => !d.equals(notification.userId));
        requester.markModified("requesting");

        receivingUser.requests = receivingUser.requests.filter(d => d !== requester.email);
        receivingUser.markModified("requests");

        await requester.save();
        await receivingUser.save();

        // Delete notification
        await notification.remove();

        res.status(200).json({message: "success"});
    } catch (e) {
        res.status(500).json({error: e});
    }
}