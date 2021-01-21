import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {userModel} from "../../models/models";

export default async function editBioHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405);
    const session = await getSession({ req });
    if (!session) {
        res.status(403).json({message: "You must be signed in to edit a user profile."});
        return;
    }
    if (!req.body.id) return res.status(422).json({message: "No user ID in request"});

    try {
        mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });

        let user = await userModel.findOne({ "_id": req.body.id });
        if (!user) return res.status(500).json({message: "No user found for given ID"});
        if (user.email !== session.user.email) return res.status(403).json({message: "You do not have permission to edit this user profile"});

        user["bio"] = req.body.bio || "";
        await user.save();

        res.status(200).json({message: "success", userData: user});
    } catch (e) {
        res.status(500).json({error: e});
    }
}