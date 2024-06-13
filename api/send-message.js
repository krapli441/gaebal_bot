const { sendSlackChannelMessage } = require("../utils/slack");

module.exports = async (req, res) => {
  const channel = "#your-channel-id"; // 슬랙 채널 ID
  const message = "This is a test message sent every minute.";
  try {
    await sendSlackChannelMessage(channel, message);
    return res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Error sending message to Slack channel:", error); // 에러 객체 전체를 로그로 출력
    return res.status(500).json({
      error: `Failed to send message: ${error.message}`,
      details: error,
    });
  }
};
