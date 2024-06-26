const axios = require("axios");

const getUserInfo = async (userId, token) => {
  try {
    const response = await axios.get("https://slack.com/api/users.info", {
      params: { user: userId },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.ok) {
      return response.data.user;
    } else {
      throw new Error(`Slack API error: ${response.data.error}`);
    }
  } catch (error) {
    if (error.response) {
      console.error("Error calling Slack API:", error.response.data);
      throw new Error(`Slack API error: ${error.response.data.error}`);
    } else {
      console.error("Error calling Slack API:", error.message);
      throw new Error(`Network or other error: ${error.message}`);
    }
  }
};

const sendSlackMessage = async (
  responseUrl,
  text,
  responseType = "in_channel"
) => {
  try {
    await axios.post(responseUrl, {
      response_type: responseType,
      text,
    });
  } catch (error) {
    console.error("Error sending Slack message:", error.message);
    throw new Error(`Error sending Slack message: ${error.message}`);
  }
};

// const isLastDayOfMonth = (date) => {
//   const tomorrow = new Date(date);
//   tomorrow.setDate(date.getDate() + 1);
//   return tomorrow.getDate() === 1;
// };

const sendSlackChannelMessage = async (channelId, text, token) => {
  try {
    await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: channelId,
        text: text,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending Slack message:", error.message);
    throw new Error(`Error sending Slack message: ${error.message}`);
  }
};

module.exports = { sendSlackChannelMessage };


module.exports = { getUserInfo, sendSlackMessage, sendSlackChannelMessage };
