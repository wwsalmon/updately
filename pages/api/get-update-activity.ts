import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { updateModel } from "../../models/models";
import dbConnect from "../../utils/dbConnect";
import { cleanForJSON } from "../../utils/utils";

export default async function getCurrUserUpdatesHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({error: "Invalid method"});
    if (!req.query.userId) return res.status(406).json({error: "userId is required"});

    try {
        console.log("here")
        await dbConnect();

        const updateActivity = await updateModel.aggregate([
            {$match: {userId: new mongoose.Types.ObjectId(`${req.query.userId}`)}},
            {$sort: {date: -1}},
            {$project: {date: 1}}
        ])

        return res.status(200).json(cleanForJSON(updateActivity)); 
    } catch (e) {
        return res.status(500).json({error: e}); 
    }
}