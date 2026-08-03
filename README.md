# Vortex07 Staff Applications

Form → compact Discord **embeds** in Application Logs.  
Optional **buttons** (Interview / Reviewing / Hold / Deny) via a Discord bot.

## Deploy

1. Import [statff-apps-v07](https://github.com/Logicnd/statff-apps-v07) on Vercel  
2. Framework: **Other** · root = `/`  
3. Env vars (below) → Deploy  

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `DISCORD_WEBHOOK` | Yes* | Posts embed to Application Logs |
| `DISCORD_BOT_TOKEN` | For buttons | Bot posts the message with components |
| `DISCORD_CHANNEL_ID` | For buttons | Application Logs channel snowflake |
| `DISCORD_PUBLIC_KEY` | For buttons | Verify button clicks at `/api/interactions` |

\*If bot token + channel id are both set, webhook is optional.

### Buttons setup (once)

1. [Discord Developer Portal](https://discord.com/developers/applications) → New Application (or existing) → **Bot** → Reset Token → copy into `DISCORD_BOT_TOKEN`  
2. OAuth2 → URL Generator → scopes `bot` → permission **Send Messages** → invite to your server  
3. Enable Developer Mode in Discord → right-click Application Logs channel → **Copy Channel ID** → `DISCORD_CHANNEL_ID`  
4. App → **General Information** → copy **Public Key** → `DISCORD_PUBLIC_KEY`  
5. Same page → **Interactions Endpoint URL** = `https://YOUR-DEPLOY.vercel.app/api/interactions` → Save  
6. Redeploy Vercel after env vars are set  

Without the bot vars you still get the clean embed via webhook (buttons need the bot).

## Local

```bash
cd ~/Desktop/Websites/staff-apps
npx vercel dev
```
