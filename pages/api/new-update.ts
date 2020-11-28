import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {userModel} from "../../models/models";
import short from "short-uuid";

export default async function newUpdateHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405);

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

        let url: string = req.body.date;
        if (req.body.title) url += "-" + encodeURIComponent(req.body.title.split(" ").slice(0, 5).join("-"));
        url += "-" + short.generate();

        thisUser.updates.push({
            date: new Date(req.body.date),
            body: req.body.body,
            url: url,
            title: req.body.title || "",
        });

        thisUser.markModified("updates");

        console.log("Update data changed. Attempting to save info with new object", thisUser);

        await thisUser.save();

        console.log("Info saved.");

        res.status(200).json({message: "success", url: "/@" + thisUser.urlName + "/" + url});
    } catch (e) {
        res.status(500).json({error: e});
    }
}