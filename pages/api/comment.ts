import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {commentModel, likeModel, notificationModel, updateModel, userModel} from "../../models/models";

export default async function newCommentHandler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    if (!session) return res.status(403).json({message: "You must be signed in to post or delete an update."});

    if (req.method === "POST") {
        const updateId = req.body.updateId;
        if (!updateId) return res.status(500).json({message: "Update id required to post comment"});

        const commentId = req.body.commentId || "";

        try {
            await mongoose.connect(process.env.MONGODB_URL, {
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
                await notificationModel.create({
                    userId: req.body.updateAuthorId,
                    updateId: updateId,
                    authorId: thisUser._id,
                    type: "comment",
                    read: false,
                });
            }

            // if comment is subcomment, create notifications for authors of all subcomments of parent comment
            if (newComment.isSubComment) {
                const parentComment = await commentModel.findOne({ _id: commentId });
                const subComments = await commentModel.find({ parentCommentId: commentId });
                const commentUserIds = [parentComment.authorId.toString(), ...subComments.map(d => d.authorId.toString())]
                    .filter((d, i, a) => a.indexOf(d) === i) // filter out duplicates
                    .filter(d => d !== thisUser._id.toString() && d !== req.body.updateAuthorId); // filter out ID of comment and post author
                for (let userId of commentUserIds) {
                    await notificationModel.create({
                        userId: userId,
                        updateId: updateId,
                        authorId: thisUser._id,
                        type: "reply",
                        read: false,
                    });
                }
            }

            res.status(200).json({message: "success", data: returnComment});
        } catch (e) {
            res.status(500).json({error: e});
        }
    } else if (req.method === "DELETE") {
        if (!req.body.commentId) return res.status(400).send("Missing commentId");

        try {
            await mongoose.connect(process.env.MONGODB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            });

            const currentUser = await userModel.findOne({ email: session.user.email });
            if (!currentUser) return res.status(403).json({message: "No account found for the logged in email"});

            const commentsAgg = await commentModel.aggregate([
                {$match: { _id: mongoose.Types.ObjectId(req.body.commentId) }},
                {$lookup: {from: "updates", localField: "updateId", foreignField: "_id", as: "updateArr"}},
                {$lookup: {from: "likes", localField: "_id", foreignField: "updateId", as: "likesArr"}},
                {
                    $lookup: {
                        from: "comments",
                        let: {"parentCommentId": "$_id"},
                        pipeline: [
                            {$match: {$expr: {$eq: ["$parentCommentId", "$$parentCommentId"]}}},
                            {$lookup: {from: "likes", localField: "_id", foreignField: "updateId", as: "likesArr"}},
                        ],
                        as: "subCommentsArr",
                    }
                }
            ]);

            const thisComment = commentsAgg[0];

            if (!thisComment) return res.status(500).json({message: "No comment found for the given id"});

            const thisUpdate = thisComment.updateArr[0];

            if (!thisUpdate) return res.status(500).json({message: "This comment is not attached to a valid update"});

            if (!(thisComment.authorId.toString() === currentUser._id.toString() || thisUpdate.userId.toString() === currentUser._id.toString())) {
                return res.status(403).json({message: "You are not have permission to delete this comment"});
            }

            const commentsToDeleteIds = [thisComment._id, ...thisComment.subCommentsArr.map(d => d._id)];
            const likesToDeleteIds = [thisComment.likesArr.map(d => d._id), ...thisComment.subCommentsArr.map(d => d.likesArr.map(x => x._id))];

            await commentModel.deleteMany({ _id: {$in: commentsToDeleteIds} });
            await likeModel.deleteMany({ _id: {$in: likesToDeleteIds} });
            res.status(200).json({message: "success"});
        } catch (e) {
            res.status(500).json({error: e});
        }
    } else {
        return res.status(405).send("Invalid method");
    }
}