import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
const url = process.env.MONGODB_AUTHENTICATOR_REGISTER_URL;

const connect = mongoose.connect;

export const connectDB = async () => {
    try {
        await connect(url, {
        });
        console.log('Database Connected Successfully');
    } catch (err) {
        console.log('Database Connection Failed', err);
        process.exit(1);

    }
};

 




