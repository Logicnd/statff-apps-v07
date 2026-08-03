/**
 * Registers /staff with Discord (guild = instant).
 *
 *   DISCORD_BOT_TOKEN=... DISCORD_APP_ID=... DISCORD_GUILD_ID=... node scripts/register-commands.js
 *
 * Or hit: GET /api/register-commands?key=TEST_EMBED_SECRET (after deploy)
 */

const token = String(process.env.DISCORD_BOT_TOKEN || "").trim();
const appId = String(process.env.DISCORD_APP_ID || "").trim();
const guildId = String(process.env.DISCORD_GUILD_ID || "").trim();

if (!token || !appId) {
  console.error("Need DISCORD_BOT_TOKEN and DISCORD_APP_ID");
  process.exit(1);
}

const commands = [
  {
    name: "staff",
    description: "Post a sample staff-application embed (with buttons) to Application Logs",
    type: 1,
  },
];

const url = guildId
  ? `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`
  : `https://discord.com/api/v10/applications/${appId}/commands`;

fetch(url, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bot ${token}`,
  },
  body: JSON.stringify(commands),
})
  .then(async (res) => {
    const text = await res.text();
    if (!res.ok) {
      console.error(res.status, text);
      process.exit(1);
    }
    console.log("Registered /staff:", text);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
