import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {updateModel, userModel} from "../../models/models";

export default async function deleteUpdateHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405);

    const session = await getSession({ req });

    if (!session) {
        res.status(403).json({message: "You must be signed in to delete an update."});
        return;
    }

    try {
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        const updateUser = await userModel.findOne({ _id: req.body.userId });
        if (updateUser === null) return res.status(500).json({message: "No update found for given username and ID"});
        const thisUpdate = await updateModel.findOne({ _id: req.body.id, userId: req.body.userId });
        if (thisUpdate === null) return res.status(500).json({message: "No update found for given username and ID"});
        if (updateUser.email !== session.user.email) return res.status(403).json({message: "You do not have permission to delete this update"});
        await updateModel.deleteOne({ _id: req.body.id });

        res.status(200).json({message: "success"});
    } catch (e) {
        res.status(500).json({error: e});
    }
}