import { User } from "../models/userModel.js";

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';


const tokenVerification = (req, res) => {
    const token = req.cookies.token
    if (!token) {
        return res.json({status: false})
    }

    jwt.verify(token, process.env.SECRET_TOKEN_AUTHENTICATOR_KEY, async (err, data) => {
        if (err) {
            return res.json({ status: false});
        } else {
            const existingUser = await User.findById(data.id)
            if (existingUser) {
                return res.json({status: true, existingUser: existingUser.username, existingAvatar: existingUser.avatar});

            } else {
                return res.json({status: false});
            }
        }
    })
}


export {tokenVerification};

