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

expressApp.get("/", (req, res) => {
  res.send("Server is running!");
});

(async () => {
  await app.start(process.env.PORT || 0);
  console.log("⚡️ Bolt app is running!");
})();

expressApp.listen(0, () => {
  console.log("Express server is running!");
});
