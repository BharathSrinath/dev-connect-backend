const express = require("express");
const connectDB = require("./config/database");
const Chats = require("./models/chats");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

const path = require("path");
const cookieParser = require("cookie-parser");

connectDB()
  .then(() => {
    console.log("Database connection successful!");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

const app = express();

app.use(express.json());
app.use(cookieParser());

const cors = require("cors");

app.use(
  cors({
    origin: "https://dev-connect-a3f5b.web.app",
    credentials: true,
  })
);

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "dist", "index.html"))
);

const server = app.listen(3000, () => {
  console.log("Server connected!");
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://dev-connect-a3f5b.web.app",
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("new message", async (newMessageReceived) => {
    const chatId = newMessageReceived.chatId;

    try {
      const chat = await Chats.findById(chatId).populate("users");

      if (!chat) {
        console.error("Chat not found");
        return;
      }

      chat.users.forEach((user) => {
        if (user._id.toString() !== newMessageReceived.sender._id) {
          socket.to(user._id).emit("message received", newMessageReceived);
        }
      });
    } catch (error) {
      console.error("Error fetching chat or sending message:", error);
    }
  });


  socket.off("setup", () => {
    socket.leave(userData._id);
  });
});
