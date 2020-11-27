import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose, {ObjectID} from "mongoose";
import {userModel} from "../../models/models";
import short from "short-uuid";
import {dateOnly} from "../../utils/utils";
import {isEqual} from "date-fns";

export default async function editUpdateHandler(req: NextApiRequest, res: NextApiResponse) {
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

        let thisUpdateUser = await userModel.findOne({ urlName: req.body.username, "updates._id": req.body.id });

        if (!thisUpdateUser) return res.status(500).json({message: "No update found for given username and ID"});

        if (thisUpdateUser.email !== session.user.email) return res.status(403).json({message: "You do not have permission to edit this update"});

        const thisUpdateIndex = thisUpdateUser.updates.findIndex(d => d._id.equals(req.body.id));

        let thisUpdatePrev = thisUpdateUser.updates[thisUpdateIndex];
        let urlChanged: boolean = false;

        if (!isEqual(dateOnly(thisUpdatePrev.date.toString()), dateOnly(req.body.date))) {
            urlChanged = true;
            let url: string = req.body.date;
            if (req.body.title) url += "-" + encodeURIComponent(req.body.title.split(" ").slice(0, 5).join("-"));
            url += "-" + short.generate();
            thisUpdatePrev["url"] = url;
        }
        thisUpdatePrev["title"] = req.body.title;
        thisUpdatePrev["date"] = req.body.date;
        thisUpdatePrev["body"] = req.body.body;

        thisUpdateUser.updates[thisUpdateIndex] = thisUpdatePrev;

        thisUpdateUser.markModified("updates");

        await thisUpdateUser.save();

        res.status(200).json({message: "success", data: thisUpdateUser, urlChanged: urlChanged});
    } catch (e) {
        res.status(500).json({error: e});
    }
}