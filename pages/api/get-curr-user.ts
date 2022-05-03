import {getSession} from "next-auth/react";
import {NextApiRequest, NextApiResponse} from "next";
import {getCurrUserRequest} from "../../utils/requests";

export default async function getCurrUserHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405);

    const session = await getSession({ req });
    if (!session) return res.status(500).json({message: "You must be signed in to get the current user profile."});

    try {
        const thisUser = await getCurrUserRequest(session.user.email);

        if (!thisUser) return res.status(500).json({message: "User profile with given email not found"});

        res.status(200).json({data: thisUser});
    } catch (e) {
        res.status(500).json({error: e});
    }
}