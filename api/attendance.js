const express = require("express");
const { getUserInfo, sendSlackMessage } = require("../utils/slack");
const { formatTimeString, calculateDuration } = require("../utils/time");
const kv = require("../config/kv");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const slackToken = process.env.SLACK_BOT_TOKEN;

app.post("/api/attendance", async (req, res) => {
  const { user_id, command, response_url } = req.body;
  const now = new Date();
  now.setHours(now.getHours() + 9); // 한국 시간대 적용 (UTC+9)
  const timeString = formatTimeString(now);
  const dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD

  console.log("Received request body:", req.body);

  try {
    const userProfile = await getUserInfo(user_id, slackToken);
    const displayName = userProfile.profile.display_name;

    let responseText = "";

    const userKey = `user:${user_id}_${dateString}`;
    const userData = await kv.hgetall(userKey);

    if (command === "/근출") {
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
    } else if (command === "/근퇴") {
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
    }

    try {
      await sendSlackMessage(response_url, responseText, "in_channel");
      res.status(200).send();
    } catch (sendError) {
      console.error("Error sending Slack message:", sendError);
      res.status(200).json({
        response_type: "ephemeral",
        text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${sendError.message}`,
        details: sendError.message,
      });
    }
  } catch (error) {
    console.error("Error fetching user info or processing attendance:", error);
    res.status(500).json({
      response_type: "ephemeral",
      text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${error.message}`,
      details: error.message,
    });
  }
});

module.exports = app;
