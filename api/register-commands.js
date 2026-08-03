/**
 * GET/POST /api/register-commands?key=TEST_EMBED_SECRET
 * Registers the /staff slash command (guild if DISCORD_GUILD_ID is set).
 */

module.exports = async function handler(req, res) {
  const secret = String(process.env.TEST_EMBED_SECRET || "").trim();
  const offered = String(req.query?.key || req.headers["x-test-key"] || "").trim();
  if (!secret || offered !== secret) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const token = String(process.env.DISCORD_BOT_TOKEN || "").trim();
  const appId = String(process.env.DISCORD_APP_ID || "").trim();
  const guildId = String(process.env.DISCORD_GUILD_ID || "").trim();

  if (!token || !appId) {
    return res.status(500).json({
      ok: false,
      error: "missing-env",
      hint: "Set DISCORD_BOT_TOKEN and DISCORD_APP_ID on Vercel.",
    });
  }

  const commands = [
    {
      name: "staff",
      description:
        "Post a sample staff-application embed (with buttons) to Application Logs",
      type: 1,
    },
  ];

  const url = guildId
    ? `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`
    : `https://discord.com/api/v10/applications/${appId}/commands`;

  try {
    const discordRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${token}`,
      },
      body: JSON.stringify(commands),
    });
    const text = await discordRes.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    if (!discordRes.ok) {
      return res.status(502).json({
        ok: false,
        error: `discord-${discordRes.status}`,
        detail: data,
      });
    }
    return res.status(200).json({
      ok: true,
      scope: guildId ? "guild" : "global",
      commands: data,
      hint: guildId
        ? "Type /staff in your server — should appear immediately."
        : "Global commands can take up to ~1 hour. Prefer DISCORD_GUILD_ID for instant.",
    });
  } catch (err) {
    return res.status(502).json({ ok: false, error: String(err?.message || err) });
  }
};
