const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { getUserInfo, sendSlackMessage } = require("./utils");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const slackToken = process.env.SLACK_BOT_TOKEN;

app.post("/api/search", async (req, res) => {
  const { user_id, user_name, command, response_url } = req.body;

  console.log("Received request body:", req.body);

  try {
    const userProfile = await getUserInfo(user_id, slackToken);
    const username = userProfile.name;
    const realName = userProfile.real_name;
    const displayName = userProfile.profile.display_name;

    const responseText = `유후~ <@${user_id}> 조회 결과 도착~\n아이디 : ${username}\n이름 : ${realName}\n닉네임 : ${displayName}`;

    await sendSlackMessage(response_url, responseText);

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

module.exports = app;
