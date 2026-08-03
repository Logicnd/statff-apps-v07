/**
 * POST /api/test-embed?key=YOUR_SECRET
 * Drops a sample one-embed application + buttons into Application Logs.
 *
 * Env: TEST_EMBED_SECRET (required), plus bot/webhook env from submit.js
 */

const { sampleApplication, messagePayload } = require("../lib/discord");

async function postWebhook(webhook, payload) {
  const url = webhook.includes("?")
    ? `${webhook}&wait=true`
    : `${webhook}?wait=true`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function postBot(token, channelId, payload) {
  return fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

module.exports = async function handler(req, res) {
  const secret = String(process.env.TEST_EMBED_SECRET || "").trim();
  const offered =
    String(req.query?.key || req.headers["x-test-key"] || "").trim();

  if (!secret || offered !== secret) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method-not-allowed" });
  }

  const webhook = String(process.env.DISCORD_WEBHOOK || "").trim();
  const botToken = String(process.env.DISCORD_BOT_TOKEN || "").trim();
  const channelId = String(process.env.DISCORD_CHANNEL_ID || "").trim();
  const payload = messagePayload(sampleApplication(), "new");

  try {
    if (botToken && channelId) {
      const r = await postBot(botToken, channelId, payload);
      const detail = await r.text().catch(() => "");
      if (!r.ok) {
        return res.status(502).json({
          ok: false,
          error: `discord-${r.status}`,
          detail: detail.slice(0, 200),
        });
      }
      return res.status(200).json({ ok: true, mode: "bot" });
    }

    if (!webhook) {
      return res.status(500).json({
        ok: false,
        error: "discord-not-configured",
      });
    }

    let r = await postWebhook(webhook, payload);
    if (!r.ok) {
      const { components: _c, ...noButtons } = payload;
      r = await postWebhook(webhook, noButtons);
    }
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return res.status(502).json({
        ok: false,
        error: `discord-${r.status}`,
        detail: detail.slice(0, 200),
      });
    }
    return res.status(200).json({ ok: true, mode: "webhook" });
  } catch (err) {
    return res.status(502).json({ ok: false, error: String(err?.message || err) });
  }
};
