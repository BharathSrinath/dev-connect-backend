const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("CONNECTED TO DATABASE!!!");
    // It is always a good practice to start listening to request once connected a database
    app.listen(3000, () => {
      console.log("Server connected to port 3000!");
    });
  })
  .catch((err) => {
    console.log("ERROR CONNECTING TO DATABASE!!!!");
    console.log(err);
  });
