const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const attendanceFile = path.join(__dirname, "../attendance.json");
const slackToken = process.env.SLACK_BOT_TOKEN;

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

app.post("/api/attendance", async (req, res) => {
  const { user_id, command } = req.body;

  // 사용자 정보를 가져오는 함수
  const getUserInfo = async (userId) => {
    const response = await axios.get("https://slack.com/api/users.info", {
      params: {
        user: userId,
      },
      headers: {
        Authorization: `Bearer ${slackToken}`,
      },
    });

    if (response.data.ok) {
      return response.data.user.profile.real_name || response.data.user.name;
    } else {
      throw new Error("Failed to fetch user info");
    }
  };

  try {
    const userName = await getUserInfo(user_id);
    const responseText = `${userName}님, 명령어 '${command}'가 정상적으로 호출되었습니다.`;

    res.json({
      response_type: "in_channel", // 공개 메시지
      text: responseText,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).send("Internal Server Error");
  }
});

// // 포트 설정 및 서버 시작 (로컬 테스트용)
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
