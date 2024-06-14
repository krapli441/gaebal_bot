const { createClient } = require("@vercel/kv");

const kv = createClient({
  url: process.env.VERCEL_KV_URL,
});

module.exports = kv;
