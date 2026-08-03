# Vortex07 Staff Applications

One big Discord **embed** + **Interview / Reviewing / Hold / Deny** buttons.

## Deploy

1. Import [statff-apps-v07](https://github.com/Logicnd/statff-apps-v07) on Vercel  
2. Set env vars → Deploy  
3. Interactions URL: `https://YOUR-DEPLOY.vercel.app/api/interactions`

## Env

| Variable | Purpose |
|----------|---------|
| `DISCORD_WEBHOOK` | Fallback post target |
| `DISCORD_BOT_TOKEN` | Buttons + `/staff-test` |
| `DISCORD_CHANNEL_ID` | Application Logs channel |
| `DISCORD_PUBLIC_KEY` | Verify interactions |
| `DISCORD_APP_ID` | Register slash commands |
| `DISCORD_GUILD_ID` | Instant guild command register |
| `TEST_EMBED_SECRET` | Protect `/api/test-embed` |

## Test the embed

**Slash command** (after register):

```bash
DISCORD_BOT_TOKEN=... DISCORD_APP_ID=... DISCORD_GUILD_ID=... node scripts/register-commands.js
```

Then in Discord: `/staff-test` → posts a sample embed with buttons to Application Logs.

**HTTP** (after setting `TEST_EMBED_SECRET`):

```text
https://YOUR-DEPLOY.vercel.app/api/test-embed?key=YOUR_SECRET
```

## Buttons setup

1. Discord app → Bot → token → `DISCORD_BOT_TOKEN`  
2. Invite bot (Send Messages)  
3. Copy Application Logs channel ID → `DISCORD_CHANNEL_ID`  
4. Public Key → `DISCORD_PUBLIC_KEY`  
5. Interactions Endpoint URL → `/api/interactions`  
6. Register `/staff-test` with the script above  
