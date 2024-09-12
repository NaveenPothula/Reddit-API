const axios = require("axios");
const User = require("./User");
require("dotenv").config();

// Reddit App Credentials
const clientId = process.env.REDDIT_CLIENT_ID;
const clientSecret = process.env.REDDIT_CLIENT_SECRET;

exports.getRedditAccessToken = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Make the request to Reddit's /api/v1/access_token endpoint
    const response = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "password",
        username: username, // Reddit username
        password: password, // Reddit password
      }),
      {
        auth: {
          username: clientId, // Reddit App Client ID
          password: clientSecret, // Reddit App Client Secret
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "script:reddit:1.0.0 (by /u/Feeling_Salad_7306)",
        },
      }
    );
    console.log(response.data.access_token);
    console.log(response);
    res.cookie("access_token", response.data.access_token, {
      path: "/",
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "Strict",
    });

    const user = await axios.get("https://oauth.reddit.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    });

    // Send back the access token to the client
    res.status(200).json({
      status: "success",
      user: user.data.name,
    });
  } catch (error) {
    // Handle any errors
    console.error(
      "Error fetching access token:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: "Failed to retrieve access token",
      details: error.response ? error.response.data : error.message,
    });
  }
};

// Replace with the access token you got from password authentication
const accessToken =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNzI2MTIwNjY5LjE5ODM5MSwiaWF0IjoxNzI2MDM0MjY5LjE5ODM5MSwianRpIjoiZFFTcGptaHFHS1dUY3NkU0dOM0NYdlg0NUMtU0tRIiwiY2lkIjoicFVvSm8xNHlQZ3gtdThXcEFSb3VBQSIsImxpZCI6InQyXzE4aDJ6cjBobTMiLCJhaWQiOiJ0Ml8xOGgyenIwaG0zIiwibGNhIjoxNzI1OTQxMTgxMDQ4LCJzY3AiOiJlSnlLVnRKU2lnVUVBQURfX3dOekFTYyIsImZsbyI6OX0.KalfNckwSvXngYTepf7ffh8OmNbvux2EYVmLvd_FXmSYNVyrjGPv5_n-iN2ZHOLeGQ7FMMgNn_ymCs1aczk08FiCws3SEZKvmILni1aEcDvXxu5LFBHX0mudgaruznCqx7wTO5aTQl_899OMlxNkZap_tPCG-mNx5j9JhWeKl36JIZ-OBwPdrqty-nSV-nIrH5-t3tE37LssWVxyQ5__B0YUWoYMZ2QxZQhCfjLNvdKi6xO854RZhLOXi2q1ADI1lf0IJ5ncTOqiPGnNzU8XRMe69AchBtkEXkWLap-itIWjAMWbU_c-_MxCA0fnjK0CcQ-X4v32AU2g_fTCnwJ3tQ";

exports.middleware = async (req, res, next) => {
  try {
    console.log(req.cookies);
    const token = req.cookies.access_token;
    console.log(token);

    const response = await axios.get("https://oauth.reddit.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    req.username = response.data.name;

    next();
  } catch (error) {
    console.error(
      "Error fetching user information:",
      error.response ? error.response.data : error.message
    );
    res.status(400).json({
      status: "fail",
      message: "user not verified please login",
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const username = req.username;
    const user = await User.findOne({ username: username });
    console.log(user);

    res.status(200).json({
      status: "success",
      user: user.username,
    });
  } catch (e) {}
};
