const Post = require("./Post");
const snoowrap = require("snoowrap");
const User = require("./User");
require("dotenv").config();

const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,

  username: "Feeling_Salad_7306",
  password: "Naveen@754",
});

exports.fetchPosts = async (req, res, next) => {
  const { subreddit } = req.body;
  let formattedPosts = [];
  try {
    console.log("requested");
    const posts = await reddit.getSubreddit(subreddit).getHot({ limit: 5 });

    formattedPosts = posts.map((post) => ({
      title: post.title,
      author: post.author.name,
      score: post.score,
      url: post.url,
      numComments: post.num_comments,
      subreddit: post.subreddit.display_name,
      selftext: post.selftext,
      subreddit_id: post.subreddit_id,
    }));

    console.log(posts);
    if (formattedPosts.length == 0) {
      res.status(401).json({
        status: "fail",
        message: "subreddit does not have posts or does not exist",
      });
    } else {
      await Post.insertMany(formattedPosts);
      res.status(200).json({
        status: "success",
        data: formattedPosts,
      });
    }

    const username = req.username;

    const user = await User.findOne({ username: username });

    user.subreddits.push(subreddit);
    await user.save();
  } catch (error) {
    console.error(`Error fetching posts from r/${subreddit}:`, error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubredditPosts = async (req, res) => {
  const { subreddit } = req.params;

  try {
    // Find all documents with the specified subreddit name
    const posts = await Post.find({
      subreddit: { $regex: new RegExp(subreddit, "i") },
    });

    if (posts.length > 0) {
      res.json(posts); // Return the posts if found
    } else {
      res
        .status(404)
        .json({ message: `No posts found for subreddit r/${subreddit}` });
    }
  } catch (error) {
    console.error(`Error fetching posts from r/${subreddit}:`, error);
    res.status(500).json({
      message: `Error fetching posts from r/${subreddit}`,
      error: error.message,
    });
  }
};

exports.deleteSubredditPosts = async (req, res) => {
  const { subreddit } = req.body;
  console.log(subreddit);

  try {
    // Delete all documents with the specified subreddit name
    const username = req.username;
    const result = await Post.deleteMany({
      subreddit: { $regex: new RegExp(subreddit, "i") },
    });

    // if (result.deletedCount > 0) {
    //   res.json({
    //     message: `${result.deletedCount} posts deleted from r/${subreddit}`,
    //   });
    // } else {
    //   res
    //     .status(404)
    //     .json({ message: `No posts found for subreddit r/${subreddit}` });
    // }

    let user = await User.findOne({ username: username });
    const subredditLower = subreddit.toLowerCase();

    user.subreddits = user.subreddits.filter(
      (item) => item.toLowerCase() !== subredditLower
    );

    console.log(user.subreddits);
    console.log(user);

    await user.save();

    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.error(`Error deleting posts from r/${subreddit}:`, error);
    res.status(500).json({
      message: `Error deleting posts from r/${subreddit}`,
      error: error.message,
    });
  }
};

exports.getSubreddits = async (req, res) => {
  try {
    const username = req.username;
    console.log(username);

    const user = await User.findOne({ username: username });
    console.log(user);

    res.status(200).json({
      status: "success",
      subreddits: user.subreddits,
    });
  } catch (e) {
    res.status(400).json({
      status: "fail",
      message: e.message,
    });
  }
};
