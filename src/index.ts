import { App } from "@slack/bolt";
import express from "express";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const expressApp = express();
expressApp.use(express.json());

const attendanceFile = "./attendance.json";

const loadAttendance = () => {
  if (fs.existsSync(attendanceFile)) {
    const data = fs.readFileSync(attendanceFile, "utf8");
    return JSON.parse(data);
  }
  return {};
};

const saveAttendance = (attendance: Record<string, string[]>) => {
  fs.writeFileSync(attendanceFile, JSON.stringify(attendance, null, 2));
};

expressApp.post("/slack/commands", async (req, res) => {
  const { text, user_id, command } = req.body;

  if (command === "/checkin") {
    const currentDate = new Date().toLocaleDateString();
    const attendance = loadAttendance();

    if (!attendance[user_id]) {
      attendance[user_id] = [];
    }

    const lastCheckIn = attendance[user_id].slice(-1)[0];
    if (lastCheckIn !== currentDate) {
      attendance[user_id].push(currentDate);
      saveAttendance(attendance);
      res.send(`<@${user_id}>님, ${currentDate}에 출석 완료!`);
    } else {
      res.send(`<@${user_id}>님, 이미 오늘 출석하셨습니다.`);
    }
  } else {
    res.send("알 수 없는 명령어입니다.");
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();

expressApp.listen(3000, () => {
  console.log("Express server is running on port 3000");
});
