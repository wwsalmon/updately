import {NextApiRequest, NextApiResponse} from "next";
import {getUpdatesRequest} from "../../utils/requests";
import { cleanForJSON } from "../../utils/utils";

export default async function getCurrUserUpdatesHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);

    try {
        const updates = await getUpdatesRequest({req});
        res.status(200).json(cleanForJSON(updates)); 
    } catch (e) {
        res.status(500).json({error: e}); 
    }
}