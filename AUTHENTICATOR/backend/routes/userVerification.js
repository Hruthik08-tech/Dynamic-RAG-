import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { tokenVerification } from "../middleware/tokenVerification.js"

const router = express.Router();

const ORIGIN_AUTHENTICATOR_FRONTEND = process.env.ORIGIN_AUTHENTICATOR_FRONTEND;
const ORIGIN_APP_FRONTEND = process.env.ORIGIN_APP_FRONTEND;


router.use(cors({
    origin: [ORIGIN_AUTHENTICATOR_FRONTEND, ORIGIN_APP_FRONTEND], 
    credentials: true
}));


router.get('/api/verifyUser', tokenVerification);


export const userVerification = router;



