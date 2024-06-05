const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const slackToken = process.env.SLACK_BOT_TOKEN;

app.post("/api/attendance", async (req, res) => {
  const { user_id, command } = req.body;

  console.log("Received request body:", req.body);

  const getUserInfo = async (userId) => {
    try {
      const response = await axios.get("https://slack.com/api/users.info", {
        params: {
          user: userId,
        },
        headers: {
          Authorization: `Bearer ${slackToken}`,
        },
      });

      console.log("Slack API response:", response.data);

      if (response.data.ok) {
        return response.data.user.profile;
      } else {
        throw new Error(`Failed to fetch user info: ${response.data.error}`);
      }
    } catch (error) {
      console.error(
        "Error calling Slack API:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  try {
    const userProfile = await getUserInfo(user_id);
    const responseText = `사용자 정보:\n이름: ${userProfile.real_name}\n닉네임: ${userProfile.display_name}\n이메일: ${userProfile.email}`;

    res.json({
      response_type: "in_channel",
      text: responseText,
    });
  } catch (error) {
    console.error("Error fetching user info:", error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
