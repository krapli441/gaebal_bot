const express = require("express");
const { Game } = require("@gathertown/gather-game-client");
const { WebSocket } = require("ws");
require("dotenv").config();

global.WebSocket = WebSocket;

const app = express();
const port = 3000;

const apiKey = "fCWInrmHqJ8WHeSY";
const spaceId = "OcIILW9NUkR8Vk2A\\gaebalgoebal";
const game = new Game(spaceId, () => Promise.resolve({ apiKey }));

const gatherTownCheck = async () => {
  game.connect();

  try {
    await new Promise((resolve) => game.subscribeToConnection(resolve));
    console.log("Connection detected");

    await new Promise((resolve) => setTimeout(resolve, 3000)); // 일정 시간 대기

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
    console.log(responseText);

    game.disconnect();
  } catch (error) {
    const errorMessage = `오류 발생: ${
      error.message
    }\n상세 내용: ${JSON.stringify(error)}`;
    console.log(errorMessage);
  }
};

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await gatherTownCheck();
});
