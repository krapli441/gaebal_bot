import { Router, Request, Response } from "express";
import { loadAttendance, saveAttendance } from "../utils/attendance";

const router = Router();

router.post("/commands", async (req: Request, res: Response) => {
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

export default router;
