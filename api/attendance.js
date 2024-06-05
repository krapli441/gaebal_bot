const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const attendanceFile = path.join(__dirname, "../attendance.json");

const readAttendanceData = () => {
  if (fs.existsSync(attendanceFile)) {
    const data = fs.readFileSync(attendanceFile);
    return JSON.parse(data);
  }
  return {};
};

const writeAttendanceData = (data) => {
  fs.writeFileSync(attendanceFile, JSON.stringify(data, null, 2));
};

app.post("/api/attendance", (req, res) => {
  const { user_id, user_name } = req.body;

  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const time = new Date().toLocaleTimeString("ko-KR", { hour12: false }); // HH:MM:SS

  const attendanceData = readAttendanceData();

  if (!attendanceData[date]) {
    attendanceData[date] = {};
  }

  if (!attendanceData[date][user_id]) {
    attendanceData[date][user_id] = { user_name, time };
    writeAttendanceData(attendanceData);

    res.send({
      response_type: "in_channel",
      text: `${user_name}님, ${date} ${time}에 출석 체크가 완료되었습니다.`,
    });
  } else {
    res.send({
      response_type: "ephemeral",
      text: `이미 오늘 출석 체크를 하셨습니다.`,
    });
  }
});

const PORT = process.env.EXPRESS_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
