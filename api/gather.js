const express = require("express");
const { Game, Player } = require("@gathertown/gather-game-client");
const { WebSocket } = require("ws");
const app = express();
const port = 3000;

global.WebSocket = WebSocket;

const apiKey = "fCWInrmHqJ8WHeSY"; // 이 키들은 env로 감춰서 배포 가능?
const spaceId = "OcIILW9NUkR8Vk2A\\gaebalgoebal"; // 이 키도!

const game = new Game(spaceId, () => Promise.resolve({ apiKey }));
game.connect();

let presentConnectedUserCounts = 0;

function subscribeToPlayerJoins() {
  return new Promise((resolve) => {
    game.subscribeToEvent("playerJoins", (player) => {
      presentConnectedUserCounts = Object.keys(game.players).length;
      // console.log("현재 접속자 수:", presentConnectedUserCounts);
      resolve(presentConnectedUserCounts);
    });
  });
}

// 초기화 함수
async function initializePlayerCounts() {
  console.log("Waiting for players to join...");

  // 현재 접속자 수를 먼저 확인
  presentConnectedUserCounts = Object.keys(game.players).length;
  // console.log("초기 접속자 수:", presentConnectedUserCounts);

  // 새로운 플레이어가 접속할 때마다 현재 접속자 수를 업데이트
  await subscribeToPlayerJoins();

  // console.log("최종 결과", presentConnectedUserCounts);

  return presentConnectedUserCounts;
}

initializePlayerCounts().then((count) => {
  console.log("게더 타운 현재 접속자 수 : ", count);
});

// game.disconnect();
