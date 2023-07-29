import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import {cleanForJSON} from "../../utils/utils";
import dbConnect from "../../utils/dbConnect";
import { updateModel, userModel } from "../../models/models";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).send("Invalid method")
    if (!req.query.query) return res.status(406).send("No query found in request")
    if (Array.isArray(req.query.query)) return res.status(406).json({message: "Invalid query"});

    const session = await getSession({req})
    if (!session) return res.status(403).send("Not logged in")

    const countPerPage = 10
    try {
        await dbConnect();

        const thisUser = await userModel.findOne({email: session.user.email})

        const matchingUpdates = await updateModel.aggregate([
            {$match: {$or: [
                {"body": {$regex: `.*${req.query.query}.*`, $options: "i"}}, 
                {"name": {$regex: `.*${req.query.query}.*`, $options: "i"}}
            ]}},
            {$sort: {updatedAt: -1}},
            {$project: {date: 1, title: 1, body: 1}},
        ])
        const count = matchingUpdates.length
        const skip = req.query.page ? (+req.query.page * countPerPage) : 0

        // it's ok if (skip + countPerPage) > filesCount, it still returns correct thing.
        const matchingUpdatesSkipped = matchingUpdates.slice(skip, skip + countPerPage)

        
        return res.status(200).json({data: cleanForJSON(matchingUpdatesSkipped), count: count})
    } catch (e) {
        return res.status(500).json({message: e});
    }
}