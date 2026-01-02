require('dotenv').config();

const { Server } = require("socket.io");


const ORIGIN = process.env.ORIGIN;

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ORIGIN, // Your React Client URL
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', async (socket) => {
        console.log(`User Connected: ${socket.id}`);
    });

    return io;

}

module.exports = initSocket;






