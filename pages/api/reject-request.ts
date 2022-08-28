import {getSession} from "next-auth/react";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {notificationModel, userModel} from "../../models/models";
import getLookup from "../../utils/getLookup";
import {res400, res403, res404, res405, res500} from "next-response-helpers";

export default async function rejectRequest(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res405(res);

    const session = await getSession({ req });
    if (!session) return res403(res);

    if (!req.body.notificationId) return res400(res, "No notification ID in request");

    try {
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const notification = await notificationModel.aggregate([
            {$match: {_id: mongoose.Types.ObjectId(req.body.notificationId)}},
            getLookup("users", "_id", "authorId", "author"),
            {$unwind: "$author"},
            getLookup("users", "_id", "userId", "user"),
            {$unwind: "$user"},
        ]);

        if (!notification) return res404(res);

        const thisNotification = notification[0];

        const author = thisNotification.author;
        const user = thisNotification.user;

        if (!author || !user) return res500(res, new Error("Author or user not found for notification"));
        if (user.email !== session.user.email) return res403(res, "You do not have permission to reject this follow request");

        const requesting = author.requesting.filter(d => !d.equals(thisNotification.userId));
        await userModel.updateOne({_id: author._id}, {$set: {requesting}});

        const requests = user.requests.filter(d => d !== user.email);
        await userModel.updateOne({_id: user._id}, {$set: {requests}});

        await notificationModel.deleteOne({_id: thisNotification._id});

        res.status(200).json({message: "success"});
    } catch (e) {
        res.status(500).json({error: e});
    }
}