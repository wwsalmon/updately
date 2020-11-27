import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import mongoose from "mongoose";
import {userModel} from "../../../models/models";
import short from "short-uuid";

const options = {
    providers: [
        Providers.Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
    ],
    callbacks: {
        signIn: async (user, account, profile) => {
            try {
                mongoose.connect(process.env.MONGODB_URL, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: false,
                });

                userModel.findOne({ email: user.email }, (err, foundItem) => {
                    if (err) return Promise.reject(new Error(err));

                    // if user object already exists, return
                    if (foundItem) return Promise.resolve(true);

                    const urlName = user.name.split(" ").join("-") + "-" + short.generate();

                    // otherwise, create new user object
                    userModel.create({
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        urlName: urlName,
                        private: false,
                    }, (err, newUser) => {
                        if (err) return Promise.reject(new Error(err));
                        return Promise.resolve(newUser);
                    });
                });
            } catch (e) {
                console.log(e);
                return Promise.reject(new Error(e));
            }
        }
    }
};

export default (req, res) => NextAuth(req, res, options);