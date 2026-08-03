# Vortex07 Staff Applications

Static form + `/api/submit` → Discord Application Logs.

## Deploy on Vercel

1. Create a **new** Vercel project from this folder (or `vercel` CLI in this directory)
2. Framework Preset → **Other**
3. Root Directory → leave as project root (this folder)
4. **Settings → Environment Variables**
   - `DISCORD_WEBHOOK` = your Discord Application Logs webhook
   - Production + Preview
5. Deploy / redeploy

Pin the `*.vercel.app` URL in Discord `#staff-applications`.

## CLI

```bash
cd ~/Desktop/Websites/staff-apps
npx vercel
npx vercel env add DISCORD_WEBHOOK
npx vercel --prod
```

## Rotate the webhook

If the webhook was ever pasted in chat, delete it in Discord and create a new one, then update the Vercel env var.
