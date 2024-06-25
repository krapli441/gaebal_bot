const { sendSlackChannelMessage } = require("../utils/slack");

module.exports = async (req, res) => {
  const channel = "C03QRB7635X"; // 슬랙 채널 ID
  const message = `<!channel> 키상!! 키상!!`;
  const token = process.env.SLACK_BOT_TOKEN;
  try {
    await sendSlackChannelMessage(channel, message, token);
    return res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Error sending message to Slack channel:", error); // 에러 객체 전체를 로그로 출력
    return res.status(500).json({
      error: `Failed to send message: ${error.message}`,
      details: error,
    });
  }
};
