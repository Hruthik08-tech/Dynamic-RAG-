import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectDB } from './connections/db.js';


const app = express();
const PORT = process.env.PORT || 5100;


const ORIGIN_AUTHENTICATOR_FRONTEND = process.env.ORIGIN_AUTHENTICATOR_FRONTEND;
const ORIGIN_APP_FRONTEND = process.env.ORIGIN_APP_FRONTEND;

// middleware 
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: [ORIGIN_AUTHENTICATOR_FRONTEND, ORIGIN_APP_FRONTEND],
    credentials: true
}));

// connect to database 
connectDB();


// routes 
import { registerUserRoute } from './routes/registerUser.js';
import { verifyLoginRoute } from './routes/verifyLogin.js';
import { verifyOTPRoute } from './routes/verifyOTP.js';
import { userVerification } from './routes/userVerification.js';


app.use(registerUserRoute);
app.use(verifyLoginRoute);
app.use(verifyOTPRoute);
app.use(userVerification);

    
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});




