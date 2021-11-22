import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/client";
import mongoose from "mongoose";
import {likeModel, notificationModel, updateModel, userModel} from "../../models/models";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        if (req.method === "GET") {
            const {updateId} = req.query;

            if (!updateId) return res.status(400).send("Missing update id");

            const likes = await likeModel.aggregate([
                {$match: {updateId: mongoose.Types.ObjectId(updateId.toString())}},
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

        const {updateId} = req.body;

        if (!updateId) return res.status(400).send("Missing update id");

        const thisUser = await userModel.findOne({email: session.user.email});

        switch (req.method) {
            case "POST": {
                const thisUpdate = await updateModel.findOne({_id: updateId});

                if (!thisUser || !thisUpdate) throw new Error("No user or update found for given parameters");

                const existingLike = await likeModel.findOne({userId: thisUser._id, updateId: thisUpdate._id});

                if (existingLike) return res.status(200).send("User already liked this update");

                await likeModel.create({
                    userId: thisUser._id,
                    updateId: thisUpdate._id,
                });

                await notificationModel.create({
                    userId: thisUpdate.userId,
                    authorId: thisUser._id,
                    updateId: updateId,
                    type: "like",
                    read: false,
                });

                return res.status(200).json({message: "success"});
            }
            case "DELETE": {
                const thisLike = await likeModel.findOne({updateId: updateId, userId: thisUser._id});

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