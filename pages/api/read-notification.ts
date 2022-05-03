import {NextApiRequest, NextApiResponse} from "next";
import {notificationModel} from "../../models/models";
import mongoose from "mongoose";
import {getSession} from "next-auth/react";
import {getCurrUserRequest} from "../../utils/requests";
import {NotificationDoc, User} from "../../utils/types";

export default async function readNotificationsHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405);
    const session = await getSession({ req });
    if (!session) return res.status(403).json({message: "You must be signed in to mark a notification as read"});
    if (!req.body.id) return res.status(422).json({message: "No notification ID found in request"});

    try {
        console.log(req.body.id);

        const thisUser: User = await getCurrUserRequest(session.user.email);
        const thisNotification: NotificationDoc = await getNotification(req.body.id);

        if (!thisNotification) return res.status(404).json({message: "No notification found for given ID"});
        if (thisNotification.userId.toString() !== thisUser._id.toString()) return res.status(403).json({message: "You do not have permission to mark this notification as read"});

        thisNotification["read"] = true;
        await thisNotification.save();
        res.status(200).json({message: "Successfully marked notification as read"});
    } catch (e) {
        res.status(500).json({error: e});
    }
}

export async function getNotification(notificationId: string): Promise<NotificationDoc> {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return notificationModel.findOne({ _id: notificationId });
}