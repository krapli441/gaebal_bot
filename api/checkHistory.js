const axios = require("axios");
const kv = require("../config/kv");
const { getUserInfo } = require("../utils/slack");
const { sendSlackMessage } = require("../utils/slack");

const checkHistory = async (req, res) => {
  const { user_id, response_url } = req.body;
  const slackToken = process.env.SLACK_BOT_TOKEN;

  try {
    // 사용자 정보 가져오기
    const userProfile = await getUserInfo(user_id, slackToken);
    const displayName = userProfile.profile.display_name;

    // KV Store에서 사용자 이력 조회
    const keysResponse = await kv.keys("*");
    const userKeys = keysResponse.filter((key) => key.includes(user_id));

    let userHistory = [];

    for (const key of userKeys) {
      const userData = await kv.hgetall(key);
      userHistory.push(userData);
    }

    // 사용자 이력을 텍스트로 변환
    let historyText = `사용자 <@${user_id}>의 출퇴근 이력:\n`;
    userHistory.forEach((data, index) => {
      historyText += `${index + 1}. 날짜: ${data.date}, 출근 시간: ${
        data.checkIn
      }, 퇴근 시간: ${data.checkOut}, 작업 시간: ${data.workDuration}\n`;
    });

    if (userHistory.length === 0) {
      historyText = `사용자 <@${user_id}>의 저장된 이력이 없습니다.`;
    }

    // 슬랙 메시지 전송
    await sendSlackMessage(response_url, historyText, "in_channel");
    res.status(200).send();
  } catch (error) {
    console.error("Error processing check-history command:", error);
    res.status(500).json({
      response_type: "ephemeral",
      text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${error.message}`,
      details: error.message,
    });
  }
};

module.exports = checkHistory;
