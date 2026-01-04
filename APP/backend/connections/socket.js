require('dotenv').config();

const { Server } = require("socket.io");


const ORIGIN_APP_FRONTEND = process.env.ORIGIN_APP_FRONTEND;

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ORIGIN_APP_FRONTEND, // Your React Client URL
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', async (socket) => {
        console.log(`User Connected: ${socket.id}`);
    });

    return io;

}

module.exports = initSocket;






