const { Game } = require("@gathertown/gather-game-client");
const { sendSlackMessage } = require("../utils/slack");

require("dotenv").config();

const apiKey = process.env.GATHER_API_KEY;
const spaceId = process.env.GATHER_SPACE_ID;

const gatherTownCheck = async (req, res) => {
  const { response_url } = req.body;

  const game = new Game(spaceId, () => Promise.resolve({ apiKey }));
  game.connect();

  try {
    await new Promise((resolve) => game.subscribeToConnection(resolve));

    // 모든 완료된 맵 ID 가져오기
    const completedMapIds = game.getKnownCompletedMaps();
    const firstMapId = completedMapIds.length > 0 ? completedMapIds[0] : "맵이 없습니다";

    // 현재 접속자 수 가져오기
    const userCount = Object.keys(game.players).length;

    // 맵 ID와 현재 접속자 수를 Slack 메시지로 전송
    const responseText = `연결 성공! 현재 맵 ID: ${firstMapId}, 접속자 수: ${userCount}명`;
    await sendSlackMessage(response_url, responseText, "in_channel");

    game.disconnect();
    res.status(200).send();
  } catch (error) {
    await sendSlackMessage(
      response_url,
      `오류 발생: ${error.message}`,
      "in_channel"
    );
    res.status(500).json({
      response_type: "ephemeral",
      text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${error.message}`,
      details: error.message,
    });
  }
};

module.exports = gatherTownCheck;