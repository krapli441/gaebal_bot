const axios = require("axios");
const kv = require("../config/kv");
const { sendSlackMessage } = require("../utils/slack");

const checkHistory = async (req, res) => {
  const { response_url } = req.body;

  try {
    console.log("Starting checkHistory function");
    console.log("Request body:", req.body);

    // KV Store의 모든 키를 조회
    const keysResponse = await kv.keys("*");
    console.log("KV Store keys response:", keysResponse);

    const responseText = `KV Store keys response: ${JSON.stringify(keysResponse)}`;

    // 슬랙 메시지 전송
    console.log("Sending Slack message with responseText:", responseText);
    await sendSlackMessage(response_url, responseText, "in_channel");
    console.log("Slack message sent successfully");

    res.status(200).send();
  } catch (error) {
    console.error("Error fetching keys from KV Store:", error);

    const errorMessage = `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${
      error.message
    }\n상세 내용: ${JSON.stringify(error)}`;

    // 슬랙 메시지 전송
    await sendSlackMessage(response_url, errorMessage, "ephemeral");

    res.status(500).json({
      response_type: "ephemeral",
      text: errorMessage,
      details: error.message,
    });
  }
};

module.exports = checkHistory;