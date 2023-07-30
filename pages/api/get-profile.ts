import {getSession} from "next-auth/react";
import {NextApiRequest, NextApiResponse} from "next";
import mongoose from "mongoose";
import {updateModel, userModel} from "../../models/models";
import {AxiosPromise} from "axios";
import {User} from "../../utils/types";

export async function getProfileReducedRequest(username: string) {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    return await userModel.findOne({ urlName: username });
}