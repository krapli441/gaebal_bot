const express = require("express");
const { getUserInfo, sendSlackMessage } = require("../utils/slack");
const { formatTimeString, calculateDuration } = require("../utils/time");
const kv = require("../config/kv");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const slackToken = process.env.SLACK_BOT_TOKEN;

// 공통 함수: 사용자 정보 및 키 생성
const getUserAndKey = async (user_id) => {
  const now = new Date();
  now.setHours(now.getHours() + 9); // 한국 시간대 적용 (UTC+9)
  const timeString = formatTimeString(now);
  const dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const userProfile = await getUserInfo(user_id, slackToken);
  const displayName = userProfile.profile.display_name;
  const userKey = `user:${user_id}_${dateString}`;
  return { timeString, dateString, displayName, userKey };
};

// 출근 처리 함수
const checkIn = async (req, res) => {
  const { user_id, response_url } = req.body;
  const { timeString, dateString, displayName, userKey } = await getUserAndKey(
    user_id
  );

  try {
    const userData = await kv.hgetall(userKey);
    let responseText = "";

    if (userData && userData.checkIn) {
      responseText = `<@${user_id}> 오늘 이미 근출 했데이~`;
    } else {
      await kv.hmset(userKey, {
        date: dateString,
        checkIn: timeString,
        checkOut: null,
        workDuration: null,
        username: displayName,
      });
      responseText = `유후~ <@${user_id}> ${timeString}에 근출~`;
    }

    await sendSlackMessage(response_url, responseText, "in_channel");
    res.status(200).send();
  } catch (error) {
    console.error("Error processing check-in:", error);
    res.status(500).json({
      response_type: "ephemeral",
      text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${error.message}`,
      details: error.message,
    });
  }
};

// 퇴근 처리 함수
const checkOut = async (req, res) => {
  const { user_id, response_url } = req.body;
  const { timeString, displayName, userKey } = await getUserAndKey(user_id);

  try {
    const userData = await kv.hgetall(userKey);
    let responseText = "";

    if (!userData || !userData.checkIn) {
      responseText = `<@${user_id}> 아직 근출을 안 했데이~`;
    } else if (userData.checkOut) {
      responseText = `<@${user_id}> 오늘 이미 근퇴 했데이~`;
    } else {
      const checkInTime = userData.checkIn;
      const checkOutTime = timeString;

      const { hours, minutes, seconds } = calculateDuration(
        checkInTime,
        checkOutTime
      );

      await kv.hmset(userKey, {
        ...userData,
        checkOut: checkOutTime,
        workDuration: `${hours}시간 ${minutes}분 ${seconds}초`,
      });

      responseText = `<@${user_id}> 근퇴~ 오늘 ${hours}시간 ${minutes}분 작업했데이~`;
    }

    await sendSlackMessage(response_url, responseText, "in_channel");
    res.status(200).send();
  } catch (error) {
    console.error("Error processing check-out:", error);
    res.status(500).json({
      response_type: "ephemeral",
      text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${error.message}`,
      details: error.message,
    });
  }
};

app.post("/api/attendance/checkIn", checkIn);
app.post("/api/attendance/checkOut", checkOut);

module.exports = app;
