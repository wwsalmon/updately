import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {updateModel, userModel} from "../../models/models";
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
        
        let user = await userModel.findOne({ "urlName": req.body.username });
        if (user === null) return res.status(500).json({message: "No update found for given username and ID"});
        if (user.email !== session.user.email) return res.status(403).json({message: "You do not have permission to edit this update"});
        const update = await updateModel.findOne({ "_id": req.body.id });
        if (update === null) return res.status(500).json({message: "No update found for given username and ID"});

        let urlChanged: boolean | string = false;

        if (!isEqual(dateOnly(update.date.toString()), dateOnly(req.body.date))) {
            let url: string = req.body.date;
            if (req.body.title) url += "-" + encodeURIComponent(req.body.title.split(" ").slice(0, 5).join("-"));
            url += "-" + short.generate();
            update["url"] = url;
            urlChanged = url;
        }
        update["title"] = req.body.title;
        update["date"] = req.body.date;
        update["body"] = req.body.body;

        await update.save();

        res.status(200).json({message: "success", urlChanged: urlChanged});
    } catch (e) {
        res.status(500).json({error: e});
    }
}