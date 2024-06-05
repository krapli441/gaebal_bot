순서를 좀 바꿔보고 싶어.

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/attendance', (req, res) => {
  const { user_name, command } = req.body;
  const responseText = `${user_name}님, 명령어 '${command}'가 정상적으로 호출되었습니다. 전체 내용은 다음과 같습니다 : ${JSON.stringify(req.body)} 그리고 user_id는 ${req.body.user_id}입니다.`;

  res.json({
    response_type: 'in_channel', // 공개 메시지
    text: responseText
  });
});

// 포트 설정 및 서버 시작 (로컬 테스트용)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;