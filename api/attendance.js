const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const slackToken = process.env.SLACK_BOT_TOKEN;

app.post("/api/attendance", async (req, res) => {
  const { user_id, user_name, command } = req.body;

  console.log("Received request body:", req.body);
  console.log(slackToken);

  // 사용자 정보를 가져오는 함수
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
        throw new Error(`Slack API error: ${response.data.error}`);
      }
    } catch (error) {
      if (error.response) {
        console.error("Error calling Slack API:", error.response.data);
        throw new Error(`Slack API error: ${error.response.data.error}`);
      } else {
        console.error("Error calling Slack API:", error.message);
        throw new Error(`Network or other error: ${error.message}`);
      }
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
    res.json({
      response_type: "ephemeral",
      text: `오류가 발생했습니다: ${error.message}`,
    });
  }
});

// 포트 설정 및 서버 시작 (로컬 테스트용)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
