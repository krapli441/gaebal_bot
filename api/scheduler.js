const express = require("express");
const { sendSlackChannelMessage } = require("../utils/slack");

const router = express.Router();
const slackChannelId = "C03QRB7635X";
const slackToken = process.env.SLACK_BOT_TOKEN;

router.post("/", async (req, res) => {
  try {
    const message = "This is a test message sent manually.";
    await sendSlackChannelMessage(slackChannelId, message, slackToken);
    console.log("Manual message sent to Slack channel.");
    res.status(200).send("Manual message sent to Slack channel.");
  } catch (error) {
    console.error("Error sending manual message to Slack:", error.message);
    res.status(500).send("Error sending manual message to Slack.");
  }
});

module.exports = router;
