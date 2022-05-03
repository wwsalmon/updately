import NextAuth, {NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {NextApiRequest, NextApiResponse} from "next";
import {createAccount} from "../../../utils/requests";
import {userModel} from "../../../models/models";
import mongoose from "mongoose";

const options: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        signIn: async ({user}) => {
            await mongoose.connect(process.env.MONGODB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            });

            const foundItem = await userModel.findOne({ email: user.email }).exec();

            if (foundItem) return true;

            await createAccount(user);

            return true;
        }
    }
};

export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, options);