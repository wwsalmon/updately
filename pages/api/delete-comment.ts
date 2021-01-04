import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {commentModel, updateModel, userModel} from "../../models/models";

export default async function deleteCommentHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405);

    const session = await getSession({ req });

    if (!session) return res.status(403).json({message: "You must be signed in to delete a comment"});

    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const currentUser = await userModel.findOne({ email: session.user.email });
        if (!currentUser) return res.status(403).json({message: "No account found for the logged in email"});

        const thisComment = await commentModel.findOne({ _id: req.body.commentId });
        if (!thisComment) return res.status(500).json({message: "No comment found for the given id"});

        const thisUpdate = await updateModel.findOne({ _id: thisComment.updateId });
        if (!thisUpdate) return res.status(500).json({message: "This comment is not attached to a valid update"});

        if (!(thisComment.authorId.toString() === currentUser._id.toString() || thisUpdate.userId.toString() === currentUser._id.toString())) {
            return res.status(403).json({message: "You are not have permission to delete this comment"});
        }

        await commentModel.deleteOne({ _id: req.body.commentId });
        res.status(200).json({message: "success"});
    } catch (e) {
        res.status(500).json({error: e});
    }
}