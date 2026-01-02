require('dotenv').config({path: '../.env'});

const mongoose = require('mongoose');


const MONGO_URL_CHAT = process.env.MONGO_URL_CHAT;

// MongoDB Connection
const connectDB = mongoose.connect(MONGO_URL_CHAT)
    .then(() => console.log('🚀 MongoDB Connected Successfully, Bro!'))
    .catch((err) => console.error('❌ Connection Error:', err));

module.exports = connectDB;

