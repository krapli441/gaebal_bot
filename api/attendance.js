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

app.post("/api/attendance", async (req, res) => {
  const { user_id, user_name, command, response_url } = req.body;
  const now = new Date();
  now.setHours(now.getHours() + 9); // 한국 시간대 적용 (UTC+9)
  const timeString = now.toLocaleTimeString("ko-KR", { hour12: false });
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
        responseText = `<@${user_id}>야~ 오늘 이미 근출 했데이~`;
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
        responseText = `<@${user_id}>~ 오늘 이미 근퇴 했데이~`;
      } else {
        const checkInTime = doc.data().checkIn;
        const checkOutTime = timeString;

        await docRef.set(
          {
            checkOut: checkOutTime,
          },
          { merge: true }
        );

        responseText = `<@${user_id}> 근퇴~ ${checkInTime}부터 ${checkOutTime} 까지~`;
      }
    }

    await sendSlackMessage(response_url, responseText);
    res.status(200).send(); // 추가 응답 없이 상태 코드만 전송
  } catch (error) {
    console.error(
      "Error fetching user info or processing attendance:",
      error.message
    );
    res.json({
      response_type: "ephemeral",
      text: `오류가 발생했습니다: ${error.message}`,
    });
  }
});

// 로컬 테스트용
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
