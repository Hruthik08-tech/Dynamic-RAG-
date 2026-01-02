require('dotenv').config();


const express = require('express');
const http = require('http');
const cors = require('cors');

const Message = require('../models/Message.js');
const connectDB = require('../connections/db.js');
const initSocket = require('../connections/socket.js');



const PORT = process.env.PORT || 3001;


const app = express();
app.use(cors());

connectDB;

const server = http.createServer(app);

const socket = initSocket(server);


socket.on('connection', async (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. Load History on Connect
  const history = await Message.find().sort({ timestamp: 1 }).limit(50);
  socket.emit('load_history', history);

  // 2. Listen for User Message
  socket.on('send_message', async (data) => {
    // Save User Message
    const userMsg = new Message({ text: data.message, sender: 'user' });
    await userMsg.save();
    
    // Broadcast User Message to frontend
    socket.emit('receive_message', userMsg);

    // 3. Trigger Bot Response "Hello World"
    setTimeout(async () => {
      const botMsg = new Message({ text: "Hello World", sender: 'bot' });
      await botMsg.save();
      socket.emit('receive_message', botMsg);
    }, 600); // Small delay to feel "alive"
  });

});

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});

