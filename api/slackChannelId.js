const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const slackToken = process.env.SLACK_BOT_TOKEN;

router.post("/", async (req, res) => {
  const { channel_name, response_url } = req.body;

  try {
    const response = await axios.get(
      "https://slack.com/api/conversations.list",
      {
        headers: {
          Authorization: `Bearer ${slackToken}`,
        },
      }
    );

    const channels = response.data.channels;
    const channel = channels.find((ch) => ch.name === channel_name);

    if (channel) {
      const responseText = `채널 이름: ${channel_name}\n채널 ID: ${channel.id}`;
      await axios.post(
        response_url,
        {
          text: responseText,
          response_type: "in_channel",
        },
        {
          headers: {
            Authorization: `Bearer ${slackToken}`,
          },
        }
      );

      res.status(200).send();
    } else {
      const responseText = `채널 이름 ${channel_name}을 찾을 수 없습니다.`;
      await axios.post(
        response_url,
        {
          text: responseText,
          response_type: "ephemeral",
        },
        {
          headers: {
            Authorization: `Bearer ${slackToken}`,
          },
        }
      );

      res.status(404).send();
    }
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
