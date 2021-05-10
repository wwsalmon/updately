import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import {getCurrUserFeedRequest, getDemoFeedRequest} from "../../utils/requests";

export default async function getCurrUserFeedHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);

    const session = await getSession({ req });

    let userData, feedData;

    try {
        if (session && !req.query.explore) {
            const userFeedObj = await getCurrUserFeedRequest(session.user, req);
            userData = userFeedObj.userData;
            feedData = userFeedObj.feedData;
        } else {
            userData = null;
            feedData = await getDemoFeedRequest( { req } );
        }
        
        res.status(200).json({userData: userData, feedData: feedData});
    } catch (e) {
        res.status(500).json({error: e});
    }
}