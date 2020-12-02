import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import mongoose from "mongoose";
import {userModel} from "../../../models/models";
import short from "short-uuid";
import {createAccount} from "../../../utils/requests";

const options = {
    providers: [
        Providers.Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
    ],
    callbacks: {
        signIn: async (user, account, profile) => {
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

export default (req, res) => NextAuth(req, res, options);