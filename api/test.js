const express = require("express");
const kv = require("../config/kv");
const { sendSlackMessage } = require("../utils/slack");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/api/test", async (req, res) => {
  const { user_id, response_url } = req.body;
  const uniqueValue = `test-${Date.now()}`;

  try {
    await kv.set(`test:${user_id}`, uniqueValue);

    const message = "테스트가 정상적으로 실행되었습니다.";

    await sendSlackMessage(response_url, message);

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
