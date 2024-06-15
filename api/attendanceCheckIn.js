const kv = require("../config/kv");
const getUserAndKey = require("../utils/getUserAndKey");
const { sendSlackMessage } = require("../utils/slack");

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

module.exports = checkIn;
