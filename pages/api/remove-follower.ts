import {getSession} from "next-auth/react";
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
        // currUser: the logged in person (the person trying to remove the follower)
        // removedUser: the follower being removed

        if (currUser._id.equals(req.body.id)) return res.status(500).json({message: "You cannot follow yourself."});

        const removedUser = await userModel.findOne({ _id: req.body.id });

        if (!removedUser) return res.status(500).json({message: "No user exists with the given ID."});

        if (currUser.followers.some(d => d === removedUser.email)) {
            currUser.followers = currUser.following.slice(0).filter(d => !d.equals(removedUser.email));
            removedUser.following = removedUser.following.slice(0).filter(d => !d.equals(currUser._id));
            currUser.markModified("followers");
            removedUser.markModified("following");
        }

        await currUser.save();
        await removedUser.save();

        res.status(200).json({message: "success", currUserData: currUser, removedUserData: removedUser});
    } catch (e) {
        res.status(500).json({error: e});
    }
}