import express from 'express';
import cors from 'cors';

import { User } from '../models/userModel.js';
import { hashPassword } from '../utils/hashPassword.js';
import { createSecretToken } from '../utils/secretToken.js';

const router = express.Router();

router.post('/api/registerUser', async(req, res) => {
    try{
        const {username, email, password, date, role, isVerified, otp} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password required", 
            })
        }
        const existing = await User.findOne({email});
        if (existing) {
            return (
                res.status(400).json({
                    message: "User already exists" 
                })
            )
        }

        const hashedPassword = await hashPassword(password);
        
        const newUser = new User({
            username: username, 
            email: email, 
            password:  hashedPassword,
            date: date, 
            role: role, 
            isVerified: isVerified, 
            otp: otp, 

        })

        const savedUser = await newUser.save();

        // create a token 
        const token = createSecretToken(newUser._id)
        // send cookie 
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            secure: false,
            path: '/'
        });
        
        res.status(201).json({message: 'User registered successfully', user: savedUser});
    } catch (error) {
        console.log("Error in /api/registerUser", error);
        res.status(500).json({
            message: 'Server error'});
    }
});

export const registerUserRoute = router;



