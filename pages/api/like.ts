import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/react";
import mongoose from "mongoose";
import {commentModel, likeModel, notificationModel, updateModel, userModel} from "../../models/models";
import {NotificationObj, NotificationTypeOpts} from "../../utils/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        if (req.method === "GET") {
            const {updateId, commentId} = req.query;

            if (!(updateId || commentId)) return res.status(400).send("Missing update or comment id");

            const nodeId = updateId || commentId;

            const likes = await likeModel.aggregate([
                {$match: {updateId: mongoose.Types.ObjectId(nodeId.toString())}},
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "userId",
                        as: "userArr",
                    },
                },
            ]);

            return res.status(200).json({likes: likes});
        }

        if (!session) return res.status(403).json({message: "You must be signed in to like an update."});

        const {updateId, commentId} = req.body;

        const nodeId = updateId || commentId;

        if (!nodeId) return res.status(400).send("Missing update or comment id");

        const thisUser = await userModel.findOne({email: session.user.email});

        switch (req.method) {
            case "POST": {
                if (!thisUser) return res.status(404).send("No user found for logged in session");

                let thisNode = !!updateId ? await updateModel.findOne({_id: nodeId}) : await commentModel.findOne({_id: nodeId});

                if (!thisNode) return res.status(404).send("No update or comment found matching ID");

                const existingLike = await likeModel.findOne({userId: thisUser._id, updateId: nodeId});

                if (existingLike) return res.status(200).send("User already liked this update");

                await likeModel.create({
                    userId: thisUser._id,
                    updateId: nodeId,
                });

                const targetUserId = !!updateId ? thisNode.userId : thisNode.authorId;

                if (targetUserId.toString() !== thisUser._id.toString()) {
                    let notificationDocBase: {userId: string, authorId: string, type: NotificationTypeOpts, read: boolean} = {
                        userId: targetUserId,
                        authorId: thisUser._id,
                        type: !!updateId ? "like" : "likeComment",
                        read: false,
                    }

                    const notificationDoc: NotificationObj = updateId ? {...notificationDocBase, updateId: nodeId} : {...notificationDocBase, updateId: thisNode.updateId, commentId: nodeId};

                    await notificationModel.create(notificationDoc);
                }

                return res.status(200).json({message: "success"});
            }
            case "DELETE": {
                const thisLike = await likeModel.findOne({updateId: nodeId, userId: thisUser._id});

                if (!thisLike) return res.status(404).send("No like found for given parameters");

                await likeModel.deleteOne({_id: thisLike._id});

                return res.status(200).send("like deleted");
            }
            default: {
                return res.status(405).json({message: "method not allowed"});
            }
        }
    } catch (e) {
        return res.status(500).json({message: e});
    }
}