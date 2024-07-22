const axios = require("axios");
const kv = require("../config/kv");
const { sendSlackMessage } = require("../utils/slack");

const checkHistory = async (req, res) => {
  const { user_id, response_url } = req.body;

  try {
    console.log("Starting checkHistory function");
    console.log("Request body:", req.body);

    // KV Store의 모든 키를 조회
    const keysResponse = await kv.keys("*");
    console.log("KV Store keys response:", keysResponse);

    const keys = keysResponse.filter((key) => key.includes(user_id));

    let userHistory = [];
    let totalHours = 0;
    let totalMinutes = 0;

    for (const key of keys) {
      const type = await kv.type(key);
      if (type === "hash") {
        const userData = await kv.hgetall(key);
        userHistory.push(userData);

        // 작업 시간을 합산
        if (userData.workDuration && userData.checkOut !== "null" && userData.checkOut) {
          const [hours, minutes, seconds] = userData.workDuration.split(":").map(Number);

          // hours, minutes, seconds가 유효한 숫자인지 확인
          if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
            totalHours += hours;
            totalMinutes += minutes;
          } else {
            console.warn(`Invalid workDuration format for key ${key}: ${userData.workDuration}`);
          }
        } else {
          console.warn(`workDuration or checkOut is missing or null for key ${key}`);
        }
      } else {
        console.warn(`Key ${key} is not a hash, it is of type ${type}`);
      }
    }

    // 분을 시간으로 변환
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    // 시간을 일수와 시간으로 변환
    const totalDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;

    // 사용자 이력을 텍스트로 변환
    let responseText = `사용자 <@${user_id}>의 출퇴근 이력:\n`;
    userHistory.forEach((data, index) => {
      const workDuration =
        data.workDuration && data.checkOut !== "null" && data.checkOut
          ? data.workDuration
          : "N/A";
      responseText += `${index + 1}. 날짜: ${data.date}, 출근 시간: ${
        data.checkIn
      }, 퇴근 시간: ${
        data.checkOut !== "null" && data.checkOut ? data.checkOut : "N/A"
      }, 작업 시간: ${workDuration}\n`;
    });

    responseText += `\n<@${user_id}> 총 ${totalDays}일 ${remainingHours}시간 ${totalMinutes}분동안 근출했데이~`;
    responseText += `\n(디버그 정보) Total hours: ${totalHours}, Total minutes: ${totalMinutes}`;
    responseText += `\n(디버그 정보) Total days: ${totalDays}, Remaining hours: ${remainingHours}`;

    if (userHistory.length === 0) {
      responseText = `사용자 <@${user_id}>의 저장된 이력이 없습니다.`;
    }

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