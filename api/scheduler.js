const { sendSlackChannelMessage } = require("../utils/slack");

module.exports = async (req, res) => {
  const slackChannelId = "C03QRB7635X"; // Slack 채널 ID
  const slackToken = process.env.SLACK_BOT_TOKEN;

  try {
    const message = "테스트 메세지 전송~";
    await sendSlackChannelMessage(slackChannelId, message, slackToken);
    console.log("Message sent to Slack channel.");
    res.status(200).send("Message sent to Slack channel.");
  } catch (error) {
    console.error("Error sending message to Slack:", error.message);
    res.status(500).send("Error sending message to Slack.");
  }
};
