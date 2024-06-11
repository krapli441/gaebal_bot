const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
require("dotenv").config();
const { getUserInfo, sendSlackMessage } = require("./utils");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const slackToken = process.env.SLACK_BOT_TOKEN;

// Firebase 초기화
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const formatTimeString = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const parseTimeString = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return { hours, minutes, seconds };
};

const calculateDuration = (startTime, endTime) => {
  const start = parseTimeString(startTime);
  const end = parseTimeString(endTime);

  const startInSeconds =
    start.hours * 3600 + start.minutes * 60 + start.seconds;
  const endInSeconds = end.hours * 3600 + end.minutes * 60 + end.seconds;

  const durationInSeconds = endInSeconds - startInSeconds;
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;

  return { hours, minutes, seconds };
};

app.post("/api/attendance", async (req, res) => {
  const { user_id, user_name, command, response_url } = req.body;
  const now = new Date();
  now.setHours(now.getHours() + 9); // 한국 시간대 적용 (UTC+9)
  const timeString = formatTimeString(now);
  const dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD

  console.log("Received request body:", req.body);

  try {
    const userProfile = await getUserInfo(user_id, slackToken);
    const username = userProfile.name;
    const realName = userProfile.real_name;
    const displayName = userProfile.profile.display_name;

    let responseText = "";

    const docRef = db.collection("attendance").doc(`${user_id}_${dateString}`);
    const doc = await docRef.get();

    if (command === "/근출") {
      if (doc.exists && doc.data().checkIn) {
        responseText = `<@${user_id}> 오늘 이미 근출 했데이~`;
      } else {
        await docRef.set(
          {
            date: dateString,
            checkIn: timeString,
            checkOut: null,
            workDuration: null,
            username: displayName,
          },
          { merge: true }
        );
        responseText = `유후~ <@${user_id}> ${timeString}에 근출~`;
      }
    } else if (command === "/근퇴") {
      if (!doc.exists || !doc.data().checkIn) {
        responseText = `<@${user_id}> 아직 근출을 안 했데이~`;
      } else if (doc.data().checkOut) {
        responseText = `<@${user_id}> 오늘 이미 근퇴 했데이~`;
      } else {
        const checkInTime = doc.data().checkIn;
        const checkOutTime = timeString;

        const { hours, minutes, seconds } = calculateDuration(
          checkInTime,
          checkOutTime
        );

        await docRef.set(
          {
            checkOut: checkOutTime,
            workDuration: `${hours}시간 ${minutes}분 ${seconds}초`,
          },
          { merge: true }
        );

        responseText = `<@${user_id}> 근퇴~ 오늘 ${hours}시간 ${minutes}분 작업했데이~`;
      }
    }

    await sendSlackMessage(response_url, responseText, "in_channel"); // 슬랙 채널에 메시지 전송

    res.status(200).send(); // 상태 코드만 전송하여 성공 응답
  } catch (error) {
    console.error(
      "Error fetching user info or processing attendance:",
      error.message
    );
    res.status(200).json({
      response_type: "ephemeral", // 사용자에게만 보이는 메시지
      text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`,
    });
  }
});

// 로컬 테스트용
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
