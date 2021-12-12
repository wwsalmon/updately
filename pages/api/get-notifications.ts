import {NextApiRequest, NextApiResponse} from "next";
import {notificationModel} from "../../models/models";
import {getSession} from "next-auth/client";
import {getCurrUserRequest} from "../../utils/requests";
import {User} from "../../utils/types";

export default async function getNotificationsHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);
    const session = await getSession({ req });
    if (!session) return res.status(403).json({message: "You must be signed in to fetch notifications"});

    try {
        const thisUser: User = await getCurrUserRequest(session.user.email);

        let notifications = await notificationModel.aggregate([
            {$match: {userId: thisUser._id}},
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "authorId",
                    as: "authorArr",
                },
            },
            {
                $lookup: {
                    from: "updates",
                    let: {"updateId": "$updateId"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$updateId"]}}},
                        {
                            $lookup: {
                                from: "users",
                                foreignField: "_id",
                                localField: "userId",
                                as: "userArr",
                            }
                        }
                    ],
                    as: "updateArr",
                },
            },
        ]);

        let notifsToDelete = [];

        // delete read notifications older than 14 days
        const oldNotificationIds: string[] = notifications
            .filter(d => d.read && +new Date() - +new Date(d.createdAt) > (14 * 8.64e7))
            .map(d => d._id.toString());

        notifsToDelete.push(...oldNotificationIds);

        // delete notifications related to updates that have been deleted
        const deletedUpdateNotifications: string[] = notifications
            .filter(d => !d.updateArr.length || !d.authorArr.length);

        notifsToDelete.push(...deletedUpdateNotifications);

        console.log(notifsToDelete);

        if (notifsToDelete.length) await notificationModel.deleteMany({"_id": {$in: notifsToDelete}});

        notifications = notifications.filter(d => !notifsToDelete.includes(d._id.toString()))

        return res.status(200).json({notifications: notifications});
    } catch (e) {
        res.status(500).json({error: e});
    }
}