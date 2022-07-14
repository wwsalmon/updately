import {getSession} from "next-auth/react";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {userModel, updateModel, notificationModel} from "../../models/models";
import short from "short-uuid";
import {isEqual} from "date-fns";
import {dateOnly} from "../../utils/utils";
import {Update, User} from "../../utils/types";

function generateUrlName(title: string, date: string) {
    let url: string = date;
    if (title) url += "-" + encodeURIComponent(title.split(" ").slice(0, 5).join("-"));
    url += "-" + short.generate();
    return url;
}

export function getMentionInfo(body: string) {
    const mentionStrings = body.match(/(?<=@\[).*?(?=\))/g);
    const mentionObjs = mentionStrings ? mentionStrings.map(d => ({
        display: d.split("](")[0],
        id: d.split("](")[1]
    })) : [];

    return {mentionStrings: mentionStrings, mentionObjs: mentionObjs};
}

export async function getMentionedUsersIds(body: string, thisUser: User) {
    const {mentionObjs} = getMentionInfo(body);
    const mentionedUsers = await userModel.find({_id: {$in: mentionObjs.map(d => d.id)}});
    const mentionedUsersIds = mentionedUsers.map(d => d._id.toString());

    return mentionedUsersIds;
}

const getMentionNotifs = (mentionedUsersIds: string[], thisUpdate: Update, thisUser: User) => mentionedUsersIds
    .filter(d => d !== thisUser._id.toString())
    .map(d => ({
        userId: d,
        updateId: thisUpdate._id,
        authorId: thisUser._id,
        type: "mentionUpdate",
        read: false,
    }));

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
            if (!req.body.id) return res.status(400).json({message: "No id provided."});
            const update = await updateModel.findOne({ "_id": req.body.id });
            if (update === null) return res.status(500).json({message: "No update found for given username and ID"});
            if (update.userId.toString() !== thisUser._id.toString()) return res.status(403).send("Unauthed");
            
            switch(req.body.requestType) {
                case "saveDraft": {
                    update["title"] = req.body.title;
                    update["date"] = req.body.date;
                    update["body"] = req.body.body;
                    await update.save();
                    return res.status(200).json({message: "success"});
                }
                case "publish": {
                    const url = generateUrlName(req.body.title, req.body.date);

                    const mentionedUsersIds = await getMentionedUsersIds(req.body.body, thisUser);

                    update["mentionedUsers"] = mentionedUsersIds;
                    update["title"] = req.body.title;
                    update["date"] = req.body.date;
                    update["body"] = req.body.body;
                    update["url"] = url;
                    update["published"] = true;

                    await update.save();

                    const notifsToAdd = getMentionNotifs(mentionedUsersIds, update, thisUser);

                    await notificationModel.insertMany(notifsToAdd);

                    return res.status(200).json({message: "success", url: "/@" + thisUser.urlName + "/" + url});
                }
                case "savePublished": {
                    let urlChanged: boolean | string = false;

                    if (!isEqual(dateOnly(update.date.toString()), dateOnly(req.body.date))) {
                        const url = generateUrlName(req.body.title, req.body.date);
                        update["url"] = url;
                        urlChanged = url;
                    }

                    const mentionedUsersIds = await getMentionedUsersIds(req.body.body, thisUser);

                    update["mentionedUsers"] = mentionedUsersIds;
                    update["title"] = req.body.title;
                    update["date"] = req.body.date;
                    update["body"] = req.body.body;

                    await update.save();

                    const newMentions = mentionedUsersIds.filter(d => !update.mentionedUsers.map(x => x.toString()).includes(d));

                    const notifsToAdd = getMentionNotifs(newMentions, update, thisUser);

                    await notificationModel.insertMany(notifsToAdd);

                    return res.status(200).json({message: "success", urlChanged: urlChanged});

                }
            }
            if (req.body.id) {

                
            } else {
                const url = generateUrlName(req.body.title, req.body.date);

                const mentionedUsersIds = await getMentionedUsersIds(req.body.body, thisUser);

                const thisUpdate = await updateModel.create({
                    date: new Date(req.body.date),
                    body: req.body.body,
                    url: url,
                    title: req.body.title || "",
                    userId: new mongoose.Types.ObjectId(thisUser.id),
                    mentionedUsers: mentionedUsersIds,
                });

                const notifsToAdd = getMentionNotifs(mentionedUsersIds, thisUpdate, thisUser);

                await notificationModel.insertMany(notifsToAdd);

                return res.status(200).json({message: "success", url: "/@" + thisUser.urlName + "/" + url});
            }
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