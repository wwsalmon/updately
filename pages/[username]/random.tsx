import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { userModel } from "../../models/models";
import getLookup from "../../utils/getLookup";
import { ssrRedirect } from "next-response-helpers";

export default function Random() {
    return (
        <></>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    if (Array.isArray(context.params.username) || context.params.username.substring(0, 1) !== "@") return { notFound: true };

    const username: string = context.params.username.substring(1);

    const pageUserArr = await userModel.aggregate([
        {$match: {urlName: username}},
        getLookup("users", "_id", "following", "followingArr"),
        getLookup("users", "email", "followers", "followersArr"),
        {
            $lookup: {
                from: "updates",
                as: "updatesArr",
                let: {userId: "$_id"},
                pipeline: [
                    {$match: {$expr: {$eq: ["$userId", "$$userId"]}}},
                    {$sample: {size: 1}},
                ],
            }
        }
    ]);

    const pageUser = pageUserArr[0];

    console.log(pageUser);

    if (!pageUser) return {notFound: true};

    const session = await getSession(context);
    const thisUser = session ? await userModel.findOne({email: session.user.email}) : null;

    const isPrivate = (pageUser.truePrivate || pageUser.private);

    const canAccess = (!isPrivate || (thisUser && (
        // following user
        pageUser.followers.includes(thisUser.email) ||
        // or are the user
        pageUser._id.toString() === thisUser._id.toString()
    )));

    if (!canAccess || !pageUser.updatesArr.length) return ssrRedirect(`/@${username}`);

    return ssrRedirect(`/@${username}/${pageUser.updatesArr[0].url}`);
}