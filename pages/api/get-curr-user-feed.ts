import {getSession} from "next-auth/client";
import {NextApiRequest, NextApiResponse} from "next";
import {getCurrUserFeedRequest, getDemoFeedRequest} from "../../utils/requests";

export default async function getCurrUserFeedHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);

    const session = await getSession({ req }); // this thing gets whether sesison exists based on our request

    let userData, feedData;

    try {
        if (session) {
            const userFeedObj = await getCurrUserFeedRequest(session.user, req); // get the current user feed based on the session's user
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