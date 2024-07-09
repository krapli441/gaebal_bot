const { Game } = require("@gathertown/gather-game-client");
const { sendSlackMessage } = require("../utils/slack");
const { WebSocket } = require("ws");
global.WebSocket = WebSocket;

require("dotenv").config();

const apiKey = process.env.GATHER_API_KEY;
const spaceId = process.env.GATHER_SPACE_ID;

const gatherTownCheck = async (req, res) => {
  const { response_url } = req.body;

  const game = new Game(spaceId, () => Promise.resolve({ apiKey }));
  game.connect();

  try {
    await new Promise((resolve) => game.subscribeToConnection(resolve));
    await sendSlackMessage(response_url, "connected", "in_channel");

    await new Promise((resolve) => setTimeout(resolve, 3000)); // 일정 시간 대기
    await sendSlackMessage(response_url, "timeout started", "in_channel");

    const completedMapIds = game.getKnownCompletedMaps();
    if (completedMapIds.length === 0) {
      throw new Error("No maps found in the space.");
    }
    const firstMapId = completedMapIds[0];

    // 첫 번째 맵의 플레이어 정보 가져오기
    const playersInMap = game.getPlayersInMap(firstMapId);

    const responseText = `연결 성공! 현재 맵 ID: ${firstMapId}, 접속자 수: ${
      Object.keys(playersInMap).length
    }명`;
    await sendSlackMessage(response_url, responseText, "in_channel");

    game.disconnect();
  } catch (error) {
    const errorMessage = `오류 발생: ${
      error.message
    }\n상세 내용: ${JSON.stringify(error)}`;
    await sendSlackMessage(response_url, errorMessage, "in_channel");

    res.status(500).json({
      response_type: "ephemeral",
      text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${error.message}`,
      details: error.message,
    });
  }
};

module.exports = gatherTownCheck;
