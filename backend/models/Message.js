const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);