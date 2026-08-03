/**
 * Posts a compact Discord embed (+ buttons when a bot token is configured).
 *
 * Env:
 *   DISCORD_WEBHOOK          — required unless bot path is fully set
 *   DISCORD_BOT_TOKEN        — optional; enables real interactive buttons
 *   DISCORD_CHANNEL_ID       — required with bot token (Application Logs channel)
 */

const { messagePayload, parseApplication } = require("../lib/discord");

async function postWebhook(webhook, payload) {
  const url = webhook.includes("?")
    ? `${webhook}&wait=true`
    : `${webhook}?wait=true`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text().catch(() => "");
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function postBotMessage(token, channelId, payload) {
  const res = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
  const text = await res.text().catch(() => "");
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method-not-allowed" });
  }

  const webhook = String(process.env.DISCORD_WEBHOOK || "").trim();
  const botToken = String(process.env.DISCORD_BOT_TOKEN || "").trim();
  const channelId = String(process.env.DISCORD_CHANNEL_ID || "").trim();

  if (!webhook && !(botToken && channelId)) {
    return res.status(500).json({
      ok: false,
      error: "discord-not-configured",
      hint: "Set DISCORD_WEBHOOK, or DISCORD_BOT_TOKEN + DISCORD_CHANNEL_ID.",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: "invalid-json" });
    }
  }

  const app = parseApplication(body);
  if (!app?.discordUsername || !app?.discordId) {
    return res.status(400).json({ ok: false, error: "invalid-application" });
  }

  const payload = messagePayload(app, "new");
  const { components: _components, ...embedOnly } = payload;

  try {
    if (botToken && channelId) {
      const result = await postBotMessage(botToken, channelId, payload);
      if (!result.ok) {
        return res.status(502).json({
          ok: false,
          error: `discord-${result.status}`,
          detail: String(
            result.data?.message || JSON.stringify(result.data) || "",
          ).slice(0, 200),
        });
      }
      return res.status(200).json({ ok: true, mode: "bot" });
    }

    let result = await postWebhook(webhook, payload);
    if (!result.ok) {
      result = await postWebhook(webhook, embedOnly);
    }
    if (!result.ok) {
      return res.status(502).json({
        ok: false,
        error: `discord-${result.status}`,
        detail: String(
          result.data?.message || JSON.stringify(result.data) || "",
        ).slice(0, 200),
      });
    }
    return res.status(200).json({
      ok: true,
      mode: "webhook",
      buttons: Boolean(result.data?.components?.length),
    });
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: String(err?.message || err),
    });
  }
};
