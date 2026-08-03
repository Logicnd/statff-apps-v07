/**
 * Vercel serverless — posts staff apps to Discord.
 * Set env DISCORD_WEBHOOK in the Vercel project (never commit the URL).
 */

function chunkContent(content, max = 1900) {
  const chunks = [];
  let buf = "";
  for (const line of String(content || "").split("\n")) {
    if ((buf + "\n" + line).length > max) {
      if (buf) chunks.push(buf);
      buf = line;
    } else {
      buf = buf ? `${buf}\n${line}` : line;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method-not-allowed" });
  }

  const webhook = String(process.env.DISCORD_WEBHOOK || "").trim();
  if (!webhook) {
    return res.status(500).json({
      ok: false,
      error: "webhook-missing",
      hint: "Set DISCORD_WEBHOOK in Vercel project env vars.",
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

  const content = String(body?.content || "").trim();
  if (content.length < 40) {
    return res.status(400).json({ ok: false, error: "empty-application" });
  }
  if (content.length > 20000) {
    return res.status(400).json({ ok: false, error: "too-large" });
  }

  try {
    for (const chunk of chunkContent(content)) {
      const discordRes = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: chunk }),
      });
      if (!discordRes.ok) {
        const detail = await discordRes.text().catch(() => "");
        return res.status(502).json({
          ok: false,
          error: `discord-${discordRes.status}`,
          detail: String(detail || "").slice(0, 200),
        });
      }
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: String(err?.message || err),
    });
  }
};
