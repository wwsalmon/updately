import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import {getUpdatesRequest} from "../../utils/requests";

export default async function getCurrUserUpdatesHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);

    const session = await getSession({ req });

    let updates;

    try {
        if (session) {
            const userFeedObj = await getUpdatesRequest({req});
            updates = userFeedObj.updates;
        } else { 
            updates = null;
        }
        
    res.status(200).json({updates: updates}); 
    } catch (e) {
        res.status(500).json({error: e}); 
    }
}