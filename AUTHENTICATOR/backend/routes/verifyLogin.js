import dotenv from 'dotenv';
dotenv.config();


import express from 'express';
import cors from 'cors';

import { User } from '../models/userModel.js';
const router = express.Router();

import { generateOTP } from '../utils/generateOTP.js';
import { comparePassword } from '../utils/decodePassword.js';
import { sendOTP } from '../utils/sendOTP.js'


const ORIGIN_AUTHENTICATOR_FRONTEND = process.env.ORIGIN_AUTHENTICATOR_FRONTEND;

router.use(cors({
    origin: ORIGIN_AUTHENTICATOR_FRONTEND
}));

router.post('/api/verifyLogin', async (req, res) => {
    const {email, password} = req.body;
    try {
        const existingUser = await User.findOne({email: email});
        if (!existingUser) {
            return res.status(404).json(
                {
                    success: false, 
                    message: "Invalid email", 
                }
            )
        }

        const isMatch = await comparePassword(password, existingUser.password);
        if (!isMatch) {
            return res.status(404).json(
                {
                    success: false,
                    message: "Invalid Password", 
                }
            )
        }
        
    
    const otp = generateOTP();
    existingUser.otp = otp;
    await existingUser.save();

    // send otp to user's email 
    await sendOTP(email, otp);

    return res.json({
        success: true,
        message: 'OTP sent to email successfully',
    })
} catch (error) {
    console.error("Error in /api/verifyLogin", error);
    res.status(500).json({
        success: false,
        message: 'Server error'
    });

} 

});

export const verifyLoginRoute = router;




    