const axios = require("axios");
const kv = require("../config/kv");
const { sendSlackMessage } = require("../utils/slack");

const checkHistory = async (req, res) => {
  const { response_url } = req.body;

  try {
    // KV Store의 모든 키를 조회
    const keysResponse = await kv.keys("*");
    const keys = keysResponse.keys; // keysResponse에서 실제 키 목록 추출

    let responseText = "KV Store에 저장된 키 목록:\n";
    keys.forEach((key, index) => {
      responseText += `${index + 1}. ${key}\n`;
    });

    if (keys.length === 0) {
      responseText = "KV Store에 저장된 키가 없습니다.";
    }

    // 슬랙 메시지 전송
    await sendSlackMessage(response_url, responseText, "in_channel");
    res.status(200).send();
  } catch (error) {
    console.error("Error fetching keys from KV Store:", error);
    res.status(500).json({
      response_type: "ephemeral",
      text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${error.message}`,
      details: error.message,
    });
  }
};

module.exports = checkHistory;