const express = require("express");
const { WebClient } = require("@slack/web-api");
const kv = require("../config/kv");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const slackToken = process.env.SLACK_BOT_TOKEN;
const slackClient = new WebClient(slackToken);

app.post("/api/test", async (req, res) => {
  const { user_id, response_url } = req.body;
  const uniqueValue = `test-${Date.now()}`;

  try {
    await kv.set(`test:${user_id}`, uniqueValue);

    const message = {
      response_type: "in_channel",
      text: "테스트가 정상적으로 실행되었습니다.",
    };

    await slackClient.chat.postMessage({
      channel: response_url,
      text: message.text,
    });

    res.status(200).send();
  } catch (error) {
    console.error("Error processing test command:", error);
    res.status(500).json({
      response_type: "ephemeral",
      text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${error.message}`,
    });
  }
});

module.exports = app;
