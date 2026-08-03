# Making the staff form feel legit (not a token grabber)

Scam forms ask for **secrets** and hide on **weird domains**. Your form should do the opposite.

## Hard rules (never break)

- Never ask for: password, token, email code, backup codes, QR scan, “authorize bot with identify+email”, Steam/Roblox password
- User ID (digits) is fine — it’s public
- Username is fine
- No URL shorteners (bit.ly etc.) in Discord announcements
- No “DM me the form” from random accounts — pin one link in `#staff-applications`

## Hosting = most of the trust

| Good | Bad |
|------|-----|
| Your `*.vercel.app` (or custom domain) with HTTPS | Random free host with 12 hyphens |
| Webhook only in Vercel env `DISCORD_WEBHOOK` | Webhook pasted into client JS |
| Pin the exact URL in `#staff-applications` | Discord attachment HTML / shorteners |
| Same brand people already know (Vortex07) | “nitro-staff-apply-free.com” |

After deploy, optionally lock hosts in `app.js`:

```js
EXPECTED_HOSTS: ["your-project.vercel.app"],
ALLOW_VERCEL_APP: true, // or false once you lock the exact host
```

This project lives at `Desktop/Websites/staff-apps` (separate from the Vortex07 extension repo).

## Discord-side trust

In `#staff-applications`, pin:

1. The **exact** HTTPS URL (no shortener)
2. “We never ask for passwords/tokens”
3. “Staff will not DM you a different form link”
4. Optional: screenshot of the form header so people recognize it

If someone posts another link, delete + warn.

## Why Google Forms *feels* safer

People already trust `docs.google.com`. If applicants are still spooked, host **this** form on your domain *or* mirror questions on Google Forms — same process, more familiar URL. The HTML form is fine when the domain + Discord pin are solid.

## Don’t look like malware

- Keep JS readable (no obfuscators, no “encoder” packs)
- Don’t auto-download .exe / .zip
- Don’t request Discord OAuth unless you build a real verified app later
- Prefer boring clarity over “FREE STAFF ROLE CLAIM NOW” energy

## Quick applicant script (put in the pin)

> Official Vortex07 staff app: `https://YOUR-HOST/...`  
> We never ask for your Discord password or token.  
> User ID = public numbers (Developer Mode).  
> Ignore any other “application” links in DMs.
