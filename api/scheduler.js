const cron = require("node-cron");
const { sendSlackChannelMessage } = require("../utils/slack");

const slackChannelId = "C03QRB7635X";
const slackToken = process.env.SLACK_BOT_TOKEN;

cron.schedule("* * * * *", async () => {
  try {
    const message = "This is a test message sent every minute.";
    await sendSlackChannelMessage(slackChannelId, message, slackToken);
    console.log("Message sent to Slack channel every minute.");
  } catch (error) {
    console.error("Error sending message to Slack:", error.message);
  }
});

console.log("Cron job scheduled to send message every minute.");
