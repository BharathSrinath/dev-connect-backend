const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const Message = require("../models/message");
const Chats = require("../models/chats");

// Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", "firstName lastName photoUrl age gender about skills");
    // }).populate("fromUserId", ["firstName", "lastName"]);

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get accepted connections for the logged-in user
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", "firstName lastName photoUrl age gender about skills")
      .populate("toUserId", "firstName lastName photoUrl age gender about skills");


    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// Get user feed, excluding connected users
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select("firstName lastName photoUrl age gender about skills")
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get chat list for the logged-in user
userRouter.get("/user/chat", userAuth, async (req, res) => {
  try {
      // Find all chats where the logged-in user is one of the users in the chat
      const chats = await Chats.find({ users: { $elemMatch: { $eq: req.user._id } } })
          .populate("users", "firstName lastName photoUrl")
          .populate("latestMessage")
          .sort({ updatedAt: -1 });

      // Populate the sender details in the latest message
      const populatedChats = await User.populate(chats, {
          path: "latestMessage.sender",
          select: "firstName lastName photoUrl",
      });

      return res.status(200).json(populatedChats);
  } catch (error) {
      return res.status(400).json({ message: error.message });
  }
});


// Create a chat between users
userRouter.post("/user/chat", userAuth, async (req, res) => {
  const { userId } = req.body;  // The ID of the user to chat with

  if (!userId) {
      return res.sendStatus(400);
  }

  try {
      // Find if a chat already exists between the logged-in user and the requested user
      let existingChat = await Chats.findOne({
          users: { $all: [req.user._id, userId] }  // Check that both users exist in the users array
      })
      .populate("users", "-password")
      .populate("latestMessage");

      if (existingChat) {
          existingChat = await User.populate(existingChat, {
              path: "latestMessage.sender",
              select: "firstName lastName photoUrl emailId",
          });
          return res.status(200).json(existingChat);
      }

      // If no chat exists, create a new one
      const chatData = {
          chatName: "sender",
          users: [req.user._id, userId],
      };

      const newChat = await Chats.create(chatData);

      const fullChat = await Chats.findOne({ _id: newChat._id })
          .populate("users", "-password");

      return res.status(200).json(fullChat);

  } catch (error) {
      return res.status(400).json({ message: error.message });
  }
});

// Get all messages in a chat
userRouter.get("/user/chat/:chatId", userAuth, async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            // .populate("sender", "firstName lastName photoUrl emailId")
            .populate("sender", "firstName emailId")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

// Send a new message
userRouter.post("/user/chat/message", userAuth, async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "firstName lastName photoUrl");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "firstName lastName photoUrl emailId",
        });

        await Chats.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

module.exports = userRouter;
