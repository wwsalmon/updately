// from https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/utils/dbConnect.js

import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL // access environment variable

if (!MONGODB_URL) {
    throw new Error("Please define the MONGODB_URL environment variable inside .env");
}

async function dbConnect() {
    // check if we have a connection to the database or if it's currently connecting or disconnecting (readyState 1, 2 and 3)
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    return mongoose.connect(MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        maxIdleTimeMS: 10000,
        socketTimeoutMS: 20000,
    });
}

export default dbConnect;