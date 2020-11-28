import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {userModel} from "../../models/models";

export default async function deleteUpdateHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405);

    const session = await getSession({ req });

    if (!session) {
        res.status(403).json({message: "You must be signed in to delete an update."});
        return;
    }

    try {
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        let thisUpdateUser = await userModel.findOne({ urlName: req.body.username, "updates._id": req.body.id });

        if (!thisUpdateUser) return res.status(500).json({message: "No update found for given username and ID"});

        if (thisUpdateUser.email !== session.user.email) return res.status(403).json({message: "You do not have permission to delete this update"});

        const newUpdates = thisUpdateUser.updates.filter(update => !update._id.equals(req.body.id));

        thisUpdateUser.updates = newUpdates;

        thisUpdateUser.markModified("updates");

        await thisUpdateUser.save();

        res.status(200).json({message: "success", data: thisUpdateUser});
    } catch (e) {
        res.status(500).json({error: e});
    }
}