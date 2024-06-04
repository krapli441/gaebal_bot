const express = require("express");
const { App } = require("@slack/bolt");
const dotenv = require("dotenv");
const { loadAttendance, saveAttendance } = require("./attendance");

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const expressApp = express();
expressApp.use(express.json());

expressApp.post("/api/slack/commands", async (req, res) => {
  const { text, user_id, command } = req.body;

  if (command === "/근출") {
    const currentDate = new Date().toLocaleDateString();
    const attendance = loadAttendance();

    if (!attendance[user_id]) {
      attendance[user_id] = [];
    }

    const lastCheckIn = attendance[user_id].slice(-1)[0];
    if (lastCheckIn !== currentDate) {
      attendance[user_id].push(currentDate);
      saveAttendance(attendance);
      res.send(`<유후~ @${user_id}> ${currentDate}에 근출 완료~`);
    } else {
      res.send(`이미 오늘 근출했데이~`);
    }
  } else {
    res.send("알 수 없는 명령어입니다.");
  }
});

expressApp.get("/", (req, res) => {
  res.send("Server is running!");
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();

const port = process.env.PORT || 3000;
expressApp.listen(port, () => {
  console.log(`Express server is running on port: ${port}`);
});
