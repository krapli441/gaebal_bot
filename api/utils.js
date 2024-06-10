const axios = require("axios");

const getUserInfo = async (userId, slackToken) => {
  try {
    const response = await axios.get("https://slack.com/api/users.info", {
      params: { user: userId },
      headers: { Authorization: `Bearer ${slackToken}` },
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

module.exports = { getUserInfo, sendSlackMessage };
