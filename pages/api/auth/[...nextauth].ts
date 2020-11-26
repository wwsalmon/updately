import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import mongoose from "mongoose";
import {userModel} from "../../../models/models";

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

                userModel.find({ email: user.email }, (err, foundItems) => {
                    if (err) return Promise.reject(new Error(err));

                    // if user object already exists, return
                    if (foundItems.length > 0) {
                        console.log(foundItems);
                        return Promise.resolve(true);
                    }

                    // otherwise, create new user object
                    userModel.create({
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    }, (err, newUser) => {
                        if (err) return Promise.reject(new Error(err));
                        console.log(newUser);
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