import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {notificationModel, userModel} from "../../models/models";

export default async function newUpdateHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405);

    const session = await getSession({ req });

    if (!session) {
        res.status(403).json({message: "You must be signed in to follow other users."});
        return;
    }

    try {
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const currUser = await userModel.findOne({ email: session.user.email });

        if (currUser._id.equals(req.body.id)) return res.status(500).json({message: "You cannot follow yourself."});

        const followUser = await userModel.findOne({ _id: req.body.id });

        if (!followUser) return res.status(500).json({message: "No user exists with the given ID."});

        if (currUser.following.some(d => d.equals(req.body.id))) {
            // if already following, unfollow
            currUser.following = currUser.following.slice(0).filter(d => !d.equals(req.body.id));
            followUser.followers = followUser.followers.slice(0).filter(d => d !== session.user.email);
        } else {
            // otherwise, follow
            currUser.following.push(req.body.id);
            followUser.followers.push(session.user.email);

            // create follow notification
            const newNotification = {
                userId: req.body.id,
                updateId: null,
                authorId: currUser._id.toString(),
                type: "follow",
                read: false,
            }
            await notificationModel.create(newNotification);
        }

        currUser.markModified("following");
        followUser.markModified("followers");

        await currUser.save();
        await followUser.save();

        res.status(200).json({message: "success", currUserData: currUser, followUserData: followUser});
    } catch (e) {
        res.status(500).json({error: e});
    }
}