const kv = require("../config/kv");
const getUserAndKey = require("../utils/getUserAndKey");
const { sendSlackMessage } = require("../utils/slack");
const { calculateDuration } = require("../utils/time");

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

      console.log(
        `Check-in time: ${checkInTime}, Check-out time: ${checkOutTime}`
      );

      const { hours, minutes, seconds, durationInSeconds } = calculateDuration(
        checkInTime,
        checkOutTime
      );

      console.log(
        `Calculated duration - hours: ${hours}, minutes: ${minutes}, seconds: ${seconds}, total seconds: ${durationInSeconds}`
      );

      await kv.hmset(userKey, {
        ...userData,
        checkOut: checkOutTime,
        workDuration: durationInSeconds, // 초 단위로 저장
      });

      responseText = `<@${user_id}> 근퇴~ 오늘 ${hours}시간 ${minutes}분 작업했데이~`;
    }

    await sendSlackMessage(response_url, responseText, "in_channel");
    res.status(200).send();
  } catch (error) {
    const errorMessage = `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${
      error.message
    }\n상세 내용: ${JSON.stringify(error)}`;
    await sendSlackMessage(response_url, errorMessage, "ephemeral");
    res.status(500).json({
      response_type: "ephemeral",
      text: errorMessage,
      details: error.message,
    });
  }
};

module.exports = checkOut;
