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
    await sendSlackMessage(response_url, "Connection detected", "in_channel");

    // playerJoins 이벤트 구독
    const playerJoinsPromise = new Promise((resolve) => {
      game.subscribeToEvent("playerJoins", (player) => {
        resolve(player);
      });
    });
    await sendSlackMessage(response_url, "Player join event subscribed", "in_channel");

    // 일정 시간 대기 (예: 3초)
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await sendSlackMessage(response_url, "3초 대기 종료", "in_channel");

    // playerJoins 이벤트를 기다리거나, 3초 대기 후 진행
    const player = await playerJoinsPromise.catch(() => null);
    const responseText = player ? `Player joined: ${JSON.stringify(player)}` : "No new players joined.";
    await sendSlackMessage(response_url, responseText, "in_channel");

    game.disconnect();
    res.status(200).send();
  } catch (error) {
    console.error("Error checking Gather Town users:", error);
    await sendSlackMessage(response_url, `오류 발생: ${error.message}`, "in_channel");
    res.status(500).json({
      response_type: "ephemeral",
      text: `명령어 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 에러: ${error.message}`,
      details: error.message,
    });
  }
};

module.exports = gatherTownCheck;