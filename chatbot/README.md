# Portfolio Chatbot — Deployment Guide

This gives your site a chat widget that answers visitor questions using ONLY
the facts in `knowledge_base.json` (your resume/project data). Every question
is logged so you can review what people are asking. Bot abuse is blocked two
ways: a Cloudflare Turnstile challenge (invisible CAPTCHA) and a per-IP rate
limit (15 messages/hour by default).

## What you'll need (all free tier)
- A Cloudflare account: https://dash.cloudflare.com/sign-up
- An Anthropic API key: https://console.anthropic.com (pay-as-you-go; a Q&A
  bot like this typically costs a few cents per 100 conversations on Haiku)
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

## 4. Set your secrets
```
wrangler secret put ANTHROPIC_API_KEY
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

## Viewing your question logs
Visit (in a browser, or via curl):
```
https://<your-worker-url>/admin?key=<your ADMIN_SECRET>
```
Returns JSON with every question, the answer given, a hashed (not raw) IP,
and a timestamp. Logs auto-expire after 90 days.

## Updating what the bot knows
Just edit `knowledge_base.json` and run `wrangler deploy` again — no code
changes needed. Keep it factual; the system prompt instructs the model to
only use what's in this file and never invent details.

## Anti-abuse summary
- **Turnstile challenge**: blocks scripted/automated submissions before they
  ever reach the AI model or your API budget.
- **Honeypot field**: a hidden form field named `website` that real users
  never see or fill; if it arrives non-empty, the request is dropped as a bot.
- **Rate limiting**: 15 messages/hour per IP by default (edit
  `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW` in `worker.js`).
- **Length cap**: messages over 800 characters are rejected, limiting
  prompt-injection/abuse surface and cost per request.
