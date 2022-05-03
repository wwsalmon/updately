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

        if (currUser._id.equals(req.body.id)) return res.status(500).json({message: "You cannot follow yourself."});

        const followUser = await userModel.findOne({ _id: req.body.id });

        if (!followUser) return res.status(500).json({message: "No user exists with the given ID."});
        
        if (currUser.following.some(d => d.equals(req.body.id))) {
            // if already following, unfollow
            currUser.following = currUser.following.slice(0).filter(d => !d.equals(req.body.id));
            followUser.followers = followUser.followers.slice(0).filter(d => d !== session.user.email);
            currUser.markModified("following");
            followUser.markModified("followers");
        } else if (currUser.requesting.some(d => d.equals(req.body.id))) {

            // if already requesting, unrequest
            currUser.requesting = currUser.requesting.filter(d => !d.equals(req.body.id));
            followUser.requests = followUser.requests.filter(d => d !== session.user.email);
            currUser.markModified("requesting");
            followUser.markModified("requests");

            // Delete the request notification
            await notificationModel.deleteOne({"authorId": currUser._id, "userId": followUser._id, "type": "request"});
        } else {
            // otherwise, follow or request to follow
            if (followUser.private || followUser.truePrivate) {
                currUser.requesting.push(req.body.id);
                followUser.requests.push(session.user.email);

                currUser.markModified("requesting");
                followUser.markModified("requests");
            } else {
                currUser.following.push(req.body.id);
                followUser.followers.push(session.user.email);
                currUser.markModified("following");
                followUser.markModified("followers");
            }
            
            // create follow notification
            const newNotification = new notificationModel({
                userId: req.body.id,
                updateId: null,
                authorId: currUser._id.toString(),
                type: (followUser.private || followUser.truePrivate) ? "request" : "follow",
                read: false,
            });
            await newNotification.save();
        }

        await currUser.save();
        await followUser.save();

        res.status(200).json({message: "success", currUserData: currUser, followUserData: followUser});
    } catch (e) {
        res.status(500).json({error: e});
    }
}