import {NextApiRequest, NextApiResponse} from "next";
import {notificationModel, updateModel, userModel} from "../../models/models";
import mongoose from "mongoose";
import {getSession} from "next-auth/client";
import {getCurrUserRequest} from "../../utils/requests";
import {Notification, Update, User} from "../../utils/types";

export default async function getNotificationsHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);
    const session = await getSession({ req });
    if (!session) return res.status(403).json({message: "You must be signed in to fetch notifications"});

    try {
        const thisUser: User = await getCurrUserRequest(session.user.email);
        const notifications: Notification[] = await getNotifications(thisUser._id.toString());
        if (notifications.length === 0) return res.status(200).json({notifications: [], users: [], updates: [], updateUsers: []});
        else {
            const uniqueAuthorIds: string[] = notifications.map(d => d.authorId).filter((d, i, a) => a.indexOf(d) === i);
            const uniqueUpdateIds: string[] = notifications.map(d => d.updateId).filter((d, i, a) => a.indexOf(d) === i);
            const users: User[] = await userModel.find({ "_id": {$in: uniqueAuthorIds}});
            const updates: Update[] = await updateModel.find({ "_id": {$in: uniqueUpdateIds}});
            const uniqueUpdateUserIds: string[] = updates.map(d => d.userId).filter((d, i, a) => a.indexOf(d) === i);
            const updateUsers: User[] = await userModel.find({ "_id": {$in: uniqueUpdateUserIds}});
            return res.status(200).json({notifications: notifications, users: users, updates: updates, updateUsers: updateUsers});
        }
    } catch (e) {
        res.status(500).json({error: e});
    }
}

export async function getNotifications(userId: string) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return notificationModel.find({ userId: userId });
}