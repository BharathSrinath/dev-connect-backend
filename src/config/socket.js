// const socketIo = require("socket.io");
// const Chat = require("../models/chat");

// module.exports = function (server) {
//   const io = socketIo(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       // credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("Connected to socket.io");

//     // Setup user socket connection
//     socket.on("setup", (userData) => {
//       socket.join(userData._id);
//       socket.emit("connected");
//     });

//     // Join a chat room
//     socket.on("join chat", (room) => {
//       socket.join(room);
//       console.log("User Joined Room: " + room);
//     });

//     // Handle typing indicator
//     socket.on("typing", (room) => socket.in(room).emit("typing"));
//     socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

//     // New message handler
//     socket.on("new message", (newMessageReceived) => {
//       const chat = newMessageReceived.chat;

//       if (!chat.users) return console.log("chat.users not defined");

//       chat.users.forEach((user) => {
//         if (user._id == newMessageReceived.sender._id) return;
//         socket.in(user._id).emit("message received", newMessageReceived);
//       });
//     });

//     // Handle user disconnection
//     socket.off("setup", () => {
//       console.log("USER DISCONNECTED");
//       socket.leave(userData._id);
//     });
//   });

//   return io;
// };
