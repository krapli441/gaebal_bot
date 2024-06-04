import { App } from "@slack/bolt";
import express from "express";
import dotenv from "dotenv";
import slackHandler from "./api/slack";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const expressApp = express();
expressApp.use(express.json());
expressApp.use("/api/slack", slackHandler);

// 테스트 엔드포인트 추가
expressApp.get("/", (req, res) => {
  res.send("Server is running!");
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();

const port = process.env.PORT || 3000;

const server = expressApp.listen(port, () => {
  const address = server.address();
  if (typeof address === "string") {
    console.log(`Express server is running on port: ${address}`);
  } else if (address && typeof address === "object") {
    console.log(`Express server is running on port: ${address.port}`);
  }
});
