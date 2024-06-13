const { sendSlackMessage } = require("../utils/slack");

module.exports = async (req, res) => {
  const channel = "C03QRB7635X"; // 슬랙 채널 ID
  const message = "This is a test message sent every minute.";
  try {
    await sendSlackMessage(channel, message);
    return res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Error sending message to Slack channel:", error.message);
    return res.status(500).json({ error: "Failed to send message." });
  }
};
