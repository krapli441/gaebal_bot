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

const sendSlackChannelMessage = async (
  channel,
  text,
  responseType = "in_channel"
) => {
  const token = process.env.SLACK_BOT_TOKEN;
  try {
    await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: channel,
        text: text,
        response_type: responseType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending Slack channel message:", error.message);
    throw new Error(`Error sending Slack channel message: ${error.message}`);
  }
};

module.exports = { getUserInfo, sendSlackMessage, sendSlackChannelMessage };
