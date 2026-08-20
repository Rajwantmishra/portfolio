# Rajwant Mishra — Portfolio Site

A single-page portfolio (`index.html`) plus an optional AI chatbot backend
(`/chatbot`) that answers visitor questions grounded in your real work.

## Publish the site (5 minutes, no command line needed)

1. Go to https://github.com/new and create a repository (e.g. `portfolio`).
   Public, no README/license needed (this folder already has one).
2. On the new repo's page, click **"uploading an existing file"** and drag in
   every file from this folder (`index.html`, the two `.docx` files, this
   `README.md`; you can skip the `chatbot/` folder for now if you're not
   setting up the bot yet).
3. Commit the files.
4. Go to **Settings → Pages**. Under "Build and deployment", set **Source**
   to "Deploy from a branch," branch `main`, folder `/ (root)`. Save.
5. After ~1 minute, your site is live at:
   `https://<your-github-username>.github.io/portfolio/`

## Before you publish
- Swap the "RM" monogram placeholder in the footer for your real photo:
  find `<div class="avatar">` in `index.html` and replace its contents with
  `<img src="your-photo.jpg" ...>` (upload the photo file alongside
  `index.html` in the same repo).
- The nav and footer "Resume ↓" buttons link to `Rajwant_Mishra_Resume.docx`
  — make sure that file is uploaded in the same repo folder.

## Adding the chatbot (optional)
See `chatbot/README.md` for full setup — it takes about 15-20 minutes and
needs a free Cloudflare account plus an Azure OpenAI resource. Once deployed,
paste your Worker URL and Turnstile site key into the two `PUT_YOUR_..._HERE`
placeholders in `index.html`, then re-upload/commit that file.

## Updating the site later
Edit `index.html` locally and re-upload it via the GitHub web UI (same drag
step as above, GitHub will offer to replace the existing file), or, if
you're comfortable with git:
```
git clone https://github.com/<you>/portfolio.git
cd portfolio
# make edits
git add .
git commit -m "update"
git push
```
