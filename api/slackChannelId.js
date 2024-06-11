const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const slackToken = process.env.SLACK_BOT_TOKEN;

router.post("/", async (req, res) => {
  const { response_url } = req.body;

  try {
    const response = await axios.get(
      "https://slack.com/api/conversations.list",
      {
        headers: {
          Authorization: `Bearer ${slackToken}`,
        },
      }
    );

    const responseText = JSON.stringify(response.data, null, 2);

    await axios.post(
      response_url,
      {
        text: `응답 본문:\n\`\`\`${responseText}\`\`\``,
        response_type: "in_channel",
      },
      {
        headers: {
          Authorization: `Bearer ${slackToken}`,
        },
      }
    );

    res.status(200).send();
  } catch (error) {
    console.error("Error fetching channel list:", error.message);
    await axios.post(
      response_url,
      {
        text: `채널 ID 조회 중 오류가 발생했습니다: ${error.message}`,
        response_type: "ephemeral",
      },
      {
        headers: {
          Authorization: `Bearer ${slackToken}`,
        },
      }
    );

    res.status(500).send();
  }
});

module.exports = router;
