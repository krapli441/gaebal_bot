import { Router, Request, Response } from "express";
import {
  loadAttendance,
  saveAttendance,
  AttendanceRecord,
} from "../utils/attendance";

const router = Router();

router.post("/commands", async (req: Request, res: Response) => {
  console.log("Received a request:", req.body);

  try {
    const { text, user_id, command } = req.body;

    if (command === "/근출") {
      const currentDate = new Date().toLocaleDateString();
      const attendance: AttendanceRecord = loadAttendance();

      if (!attendance[user_id]) {
        attendance[user_id] = [];
      }

      const lastCheckIn = attendance[user_id].slice(-1)[0];
      if (lastCheckIn !== currentDate) {
        attendance[user_id].push(currentDate);
        saveAttendance(attendance);
        console.log("Check-in successful:", user_id, currentDate);
        res.json({ text: `<유후~ @${user_id}> ${currentDate}에 근출 완료~` });
      } else {
        console.log("Already checked in today:", user_id);
        res.json({ text: "이미 오늘 근출했데이~" });
      }
    } else {
      console.log("Unknown command received:", command);
      res.json({ text: "알 수 없는 명령어입니다." });
    }
  } catch (error) {
    console.error("Error handling command:", error);
    res
      .status(500)
      .json({ text: "서버에서 오류가 발생했습니다. 다시 시도해 주세요." });
  }
});

export default router;
