const { getUserInfo } = require("../utils/slack");
const { formatTimeString } = require("../utils/time");
const slackToken = process.env.SLACK_BOT_TOKEN;

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

module.exports = getUserAndKey;
