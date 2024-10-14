const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  chatName: {
      type: String
  },
  users: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
      }
  ],
  latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
  }
}, { timestamps: true })

const Chats = new mongoose.model('Chats', chatSchema);

module.exports = Chats;