# Portfolio Chatbot — Deployment Guide

This gives your site a chat widget that answers visitor questions using ONLY
the facts in `knowledge_base.json` (your resume/project data). Every question
is logged so you can review what people are asking. Bot abuse is blocked two
ways: a Cloudflare Turnstile challenge (invisible CAPTCHA) and a per-IP rate
limit (15 messages/hour by default).

## What you'll need
- A Cloudflare account: https://dash.cloudflare.com/sign-up (free tier)
- An Azure OpenAI resource with a chat-completion model deployed
  (Azure Portal → Azure OpenAI resource → Deployments). You'll need the
  resource **endpoint**, the **deployment name**, and an **API key**.
- Node.js installed on your machine (to run `wrangler`, Cloudflare's CLI)

## 1. Install Wrangler and log in
```
npm install -g wrangler
wrangler login
```

## 2. Create the KV namespace (stores rate-limit counters + question logs)
```
cd chatbot
wrangler kv namespace create CHAT_KV
```
Copy the `id` it prints and paste it into `wrangler.toml` under
`[[kv_namespaces]]`.

## 3. Get a Turnstile site key + secret (free bot-protection widget)
1. In the Cloudflare dashboard, go to **Turnstile** → **Add site**
2. Use "Managed" challenge type, add your future GitHub Pages domain
   (e.g. `yourname.github.io`)
3. Copy the **Site Key** into `wrangler.toml` (`TURNSTILE_SITE_KEY`) AND into
   `index.html` (search for `data-sitekey="PUT_YOUR_TURNSTILE_SITE_KEY_HERE"`)
4. Copy the **Secret Key** — you'll set it as a Worker secret in step 4

## 4. Fill in Azure OpenAI config and set your secrets
In `wrangler.toml`, fill in `AZURE_OPENAI_ENDPOINT` (e.g.
`https://your-resource.openai.azure.com`) and `AZURE_OPENAI_DEPLOYMENT`
(your model deployment name). Adjust `AZURE_OPENAI_API_VERSION` if needed.

Then set the secrets:
```
wrangler secret put AZURE_OPENAI_API_KEY
wrangler secret put TURNSTILE_SECRET
wrangler secret put ADMIN_SECRET
```
`ADMIN_SECRET` is a password you make up yourself — it's how you'll view your
question logs later. Pick something long and random.

## 5. Deploy
```
wrangler deploy
```
This prints your live Worker URL, something like:
`https://rm-portfolio-chatbot.<your-subdomain>.workers.dev`

## 6. Connect the widget to your Worker
Open `index.html`, find this line near the bottom:
```js
const CHATBOT_ENDPOINT = "PUT_YOUR_WORKER_URL_HERE";
```
Replace it with the URL from step 5 (no trailing slash).

## 7. Lock down CORS (recommended, after you know your Pages URL)
In `worker.js`, change:
```js
const ALLOWED_ORIGIN = "*";
```
to your actual GitHub Pages URL, e.g.:
```js
const ALLOWED_ORIGIN = "https://yourname.github.io";
```
Then `wrangler deploy` again.

## Admin dashboard
Visit in a browser:
```
https://<your-worker-url>/admin?key=<your ADMIN_SECRET>
```
This gives you:
- A **knowledge base editor** — a textarea with the bot's current knowledge
  base JSON. Edit it and click "Save & deploy live" — changes apply
  immediately, no `wrangler deploy` needed. "Reset to file default" discards
  any admin edits and reverts to whatever is bundled in `knowledge_base.json`
  at your last deploy.
- A **question log table** — every question asked, the answer given, the
  visitor's name/email/purpose (from the chat intake gate), and when, for
  the last 90 days.
- A **leads table** — name + email captured from the resume-download gate
  on the site (also reusable for any other lead-capture form via `/lead`).

Raw JSON is also available directly, if you prefer curl/scripts:
- `GET /admin/logs?key=<ADMIN_SECRET>&limit=50` — question logs
- `GET /admin/leads?key=<ADMIN_SECRET>&limit=50` — leads (resume downloads, etc.)
- `GET /admin/kb?key=<ADMIN_SECRET>` — current knowledge base + whether it's
  the file default or an admin-saved override
- `POST /admin/kb?key=<ADMIN_SECRET>` — replace the knowledge base (raw JSON
  body)
- `POST /admin/kb/reset?key=<ADMIN_SECRET>` — revert to the file default

## Updating what the bot knows
Two ways:
1. **Admin dashboard** (above) — edits take effect immediately, but only
   live in Cloudflare KV; `knowledge_base.json` in the repo is unchanged
   until you also copy your edits back into the file.
2. **Edit `knowledge_base.json` directly** and run `wrangler deploy` — this
   is what "Reset to file default" reverts to, so it's the source of truth
   for a fresh deploy.

Keep it factual either way; the system prompt instructs the model to only
use what's in the knowledge base and never invent details.

## Anti-abuse summary
- **Turnstile challenge**: blocks scripted/automated submissions before they
  ever reach the AI model or your API budget.
- **Honeypot field**: a hidden form field named `website` that real users
  never see or fill; if it arrives non-empty, the request is dropped as a bot.
- **Rate limiting**: 15 messages/hour per IP by default (edit
  `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW` in `worker.js`).
- **Length cap**: messages over 800 characters are rejected, limiting
  prompt-injection/abuse surface and cost per request.
