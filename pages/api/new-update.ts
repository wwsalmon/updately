import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {userModel} from "../../models/models";

export default async function newUpdateHandler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session) {
        res.status(403).json({message: "You must be signed in to post an update."});
        return;
    }

    try {
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const thisUser = await userModel.findOne({ email: session.user.email });

        thisUser.updates.push({
            date: new Date(req.body.date),
            body: req.body.body,
            title: req.body.title || "",
        });

        thisUser.markModified("updates");

        console.log("Update data changed. Attempting to save info with new object", thisUser);

        await thisUser.save();

        console.log("Info saved.");

        res.status(200).json({message: "success"});
    } catch (e) {
        res.status(500).json({error: e});
    }
}