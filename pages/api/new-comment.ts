import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {commentModel, notificationModel, updateModel, userModel} from "../../models/models";
import {Update, User} from "../../utils/types";
import {format} from "date-fns";

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

        // if comment author is not update author, create notification for update author
        if (req.body.updateAuthorId !== thisUser._id.toString()) {
            const newNotification = {
                userId: req.body.updateAuthorId,
                updateId: updateId,
                authorId: thisUser._id,
                type: "comment",
                read: false,
            }
            await notificationModel.create(newNotification);
        }

        // if comment is subcomment, create notifications for authors of all subcomments of parent comment
        if (newComment.isSubComment) {
            const parentComment = await commentModel.findOne({ _id: commentId });
            const subComments = await commentModel.find({ parentCommentId: commentId });
            const commentUserIds = [parentComment.authorId.toString(), ...subComments.map(d => d.authorId.toString())]
                .filter((d, i, a) => a.indexOf(d) === i) // filter out duplicates
                .filter(d => d !== thisUser._id.toString() && d !== req.body.updateAuthorId); // filter out ID of comment and post author
            for (let userId of commentUserIds) {
                const newNotification = {
                    userId: userId,
                    updateId: updateId,
                    authorId: thisUser._id,
                    type: "reply",
                    read: false,
                }
                await notificationModel.create(newNotification);
            }
        }

        res.status(200).json({message: "success", data: returnComment});
    } catch (e) {
        res.status(500).json({error: e});
    }
}