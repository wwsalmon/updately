import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {commentModel, userModel} from "../../models/models";

export default async function newCommentHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405);
    const session = await getSession({ req });
    if (!session) return res.status(403).json({message: "You must be signed in to post an update."});

    const updateId = req.body.updateId;
    if (!updateId) return res.status(500).json({message: "Update id required to post comment"});

    const commentId = req.body.commentId || "";

    try {
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const thisUser = await userModel.findOne({ email: session.user.email });

        const newComment = {
            body: req.body.commentText,
            authorId: new mongoose.Types.ObjectId(thisUser._id),
            updateId: new mongoose.Types.ObjectId(updateId),
            isSubComment: !!commentId,
            parentCommentId: commentId ? new mongoose.Types.ObjectId(commentId) : null,
        };

        const returnComment = await commentModel.create(newComment);

        res.status(200).json({message: "success", data: returnComment});
    } catch (e) {
        res.status(500).json({error: e});
    }
}