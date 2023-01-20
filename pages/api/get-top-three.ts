import {getSession} from "next-auth/react";
import {NextApiRequest, NextApiResponse} from "next";
import {getCurrUserRequest, getTopThree} from "../../utils/requests";

export default async function getTopThreeHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);
    try {
        const topThree = await getTopThree(req.query.userId as string, req.query.updateId as string);

        res.status(200).json({data: topThree.map(update => ({
          date: update.date,
          title: update.title,
          url: update.url
        }))});
    } catch (e) {
        res.status(500).json({error: e});
    }
}