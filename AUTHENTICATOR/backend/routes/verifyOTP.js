import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { User } from '../models/userModel.js';
import { createSecretToken } from '../utils/secretToken.js';

const router = express.Router();

const ORIGIN_AUTHENTICATOR_FRONTEND = process.env.ORIGIN_AUTHENTICATOR_FRONTEND;
const ORIGIN_APP_FRONTEND = process.env.ORIGIN_APP_FRONTEND;

router.use(cors({
    origin: [ORIGIN_AUTHENTICATOR_FRONTEND, ORIGIN_APP_FRONTEND],
    credentials: true 
}));

router.post('/api/verifyOTP', async (req, res) => {
    const {otp} = req.body;
    try {
        const existingUser = await User.findOne({otp: otp});
        if (!existingUser) {
            return res.status(404).json(
                {
                    success: false, 
                    message: "Invalid OTP or email", 
                }
            );

        } 
            existingUser.otp = null;
            await existingUser.save();

            // create token and send cookie 
            const token = createSecretToken(existingUser._id);
            // Set cookie with appropriate options for cross-port requests
            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
                sameSite: 'lax', // 'lax' works for top-level navigations on localhost
                secure: false, // set true when using HTTPS
                path: '/'
            });
            
            return res.json({
                success: true,
                message: 'OTP verified successfully', 
                username: existingUser.username
            });
    } catch (error) {
        console.error("Error in /api/verifyOTP", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }

});


export const verifyOTPRoute = router;

