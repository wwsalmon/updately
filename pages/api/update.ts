import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {userModel, updateModel} from "../../models/models";
import short from "short-uuid";
import {isEqual} from "date-fns";
import {dateOnly} from "../../utils/utils";

function generateUrlName(title: string, date: string) {
    let url: string = date;
    if (title) url += "-" + encodeURIComponent(title.split(" ").slice(0, 5).join("-"));
    url += "-" + short.generate();
    return url;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session) return res.status(403).json({message: "You must be signed in to post or update an update."});

    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const thisUser = await userModel.findOne({ email: session.user.email });

        if (req.method === "POST") {
            if (req.body.id) {
                const update = await updateModel.findOne({ "_id": req.body.id });
                if (update === null) return res.status(500).json({message: "No update found for given username and ID"});
                if (update.userId.toString() !== thisUser._id.toString()) return res.status(403).send("Unauthed");

                let urlChanged: boolean | string = false;

                if (!isEqual(dateOnly(update.date.toString()), dateOnly(req.body.date))) {
                    const url = generateUrlName(req.body.title, req.body.date);
                    update["url"] = url;
                    urlChanged = url;
                }

                update["title"] = req.body.title;
                update["date"] = req.body.date;
                update["body"] = req.body.body;

                await update.save();

                return res.status(200).json({message: "success", urlChanged: urlChanged});
            }

            const url = generateUrlName(req.body.title, req.body.date)

            const newUpdate = {
                date: new Date(req.body.date),
                body: req.body.body,
                url: url,
                title: req.body.title || "",
                userId: new mongoose.Types.ObjectId(thisUser.id),
            };

            await updateModel.create(newUpdate);

            return res.status(200).json({message: "success", url: "/@" + thisUser.urlName + "/" + url});
        } else if (req.method === "DELETE") {
            if (!req.body.id) return res.status(400).send("No ID in request");

            const thisUpdate = await updateModel.findOne({ _id: req.body.id });
            if (thisUpdate === null) return res.status(500).json({message: "No update found for given ID"});
            if (thisUpdate.userId.toString() !== thisUser._id.toString()) return res.status(403).send("Unauthed");
            await updateModel.deleteOne({ _id: req.body.id });

            res.status(200).json({message: "success"});
        } else {
            return res.status(405).send("Invalid method");
        }
    } catch (e) {
        return res.status(500).json({error: e});
    }
}