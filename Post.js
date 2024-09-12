const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
  },
  author: String,
  score: Number,
  url: String,
  numComments: Number,
  subreddit: String,
  selftext: String,
  subreddit_id: String,
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
