import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {updateModel, userModel} from "../../models/models";
import {AxiosPromise} from "axios";

export default async function getProfileHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);

    const session = await getSession({ req });
    if (Array.isArray(req.query.username)) return res.status(500).json({message: "Error: multiple usernames in query"});
    const username: string = req.query.username;
    if (!username) return res.status(500).json({message: "Cannot get profile, no username given"});

    try {
        const thisUser = await getProfileRequest(username);

        if (!thisUser) return res.status(404).json({message: "Profile with given username not found"});

        res.status(200).json({data: thisUser});
    } catch (e) {
        res.status(500).json({error: e});
    }
}

export async function getProfileRequest(username: string) {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    let userData = await userModel.findOne({ urlName: username });

    if (userData === null) return null;

    const userUpdates = await updateModel.find({ userId: userData.id });

    userData.updates.push.apply(userData.updates, userUpdates);

    return userData;
}