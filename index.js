// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const snoowrap = require("snoowrap");
const postController = require("./postController");
const userController = require("./userController");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const User = require("./User");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

//app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend origin
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("succesful"));

const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,

  username: "Feeling_Salad_7306",
  password: "Naveen@754",
});

app.post("/api/login", userController.getRedditAccessToken);
//app.get("/api/verify", userController.middleware);

app.post(
  "/api/fetch-posts",
  userController.middleware,
  postController.fetchPosts
);

app.delete(
  "/api/delete-posts",
  userController.middleware,
  postController.deleteSubredditPosts
);

app.get("/api/posts", userController.middleware, postController.getPosts);

app.get(
  "/api/fetch-subreddits",
  userController.middleware,
  postController.getSubreddits
);

app.get(
  "/api/get-posts/:subreddit",
  userController.middleware,
  postController.getSubredditPosts
);

// app.post("/api/register", async (req, res) => {
//   try {
//     const user = await User.create(req.body);
//     res.json("success");
//   } catch (e) {
//     res.json("fail");
//   }
// });

app.get("/api/verify", userController.middleware, userController.getUser);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Hello from server",
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTIONS! Shuting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM! Shuting down...");
  server.close(() => {
    console.log("Process terminated");
  });
});
