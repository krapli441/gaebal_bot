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

    // 연결 후 일정 시간 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const userCount = Object.keys(game.players).length;
    const responseText = `현재 게더 타운 접속자 수: ${userCount}명`;

    await sendSlackMessage(response_url, responseText, "in_channel");
    game.disconnect();
    res.status(200).send();
  } catch (error) {
    console.error("Error checking Gather Town users:", error);
    res.status(500).json({
      response_type: "ephemeral",
      text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${error.message}`,
      details: error.message,
    });
  }
};

module.exports = gatherTownCheck;
