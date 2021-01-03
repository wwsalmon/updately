import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {commentModel, userModel} from "../../models/models";
import {User} from "../../utils/types";
import {getProfilesByIds} from "../../utils/requests";

export default async function getCommentsHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);

    try {
        if (Array.isArray(req.query.updateId)) return res.status(500).json({message: "Error: multiple update ids in query"});
        const updateId: string = req.query.updateId;
        if (!updateId) return res.status(500).json({message: "Cannot get profile, no update id given"});
        const comments = await getComments(updateId);
        const commentsUsers = comments.length > 0 ? (await async function(){
            let commentsUserIds = [];
            for (let comment of comments) {
                if (!commentsUserIds.includes(comment.authorId)) commentsUserIds.push(comment.authorId);
            }
            return getProfilesByIds(commentsUserIds);
        }()) : null;
        res.status(200).json({comments: comments, users: commentsUsers});
    } catch (e) {
        res.status(500).json({error: e});
    }
}

export async function getComments(updateId: string) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return commentModel.find({ updateId: updateId });
}