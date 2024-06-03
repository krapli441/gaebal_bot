import { App } from "@slack/bolt";
import express, { Request, Response } from "express";
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

expressApp.post("/api/slack/commands", async (req: Request, res: Response) => {
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
      res.send(`<이미 오늘 근출했데이~`);
    }
  } else {
    res.send("알 수 없는 명령어입니다.");
  }
});

module.exports = expressApp;
