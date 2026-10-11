# Putting yasunagaoscar.com live on GitHub Pages

This takes about 20 minutes. The domain **yasunagaoscar.com** is registered at Cloudflare.

## 1. Lock down your accounts
Turn on two-factor authentication on GitHub and Cloudflare. Whoever controls those two accounts controls the site.

## 2. Put the project in the repository
1. The repository is `github.com/oscaryas/oscaryas.com`. Its name doesn't have to match the domain.
   It must be public for GitHub Pages on a free plan.
2. Upload everything in this folder to it. Easiest from a terminal in this folder:
   ```bash
   git init
   git add .
   git commit -m "First version of yasunagaoscar.com"
   git branch -M main
   git remote add origin https://github.com/oscaryas/oscaryas.com.git
   git push -u origin main
   ```
3. If your repository has a different name or account, change `repoUrl` in `content/site.json`.

## 3. Turn on GitHub Pages
1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Go to the **Actions** tab. The "Deploy to GitHub Pages" run starts on every push; wait for the green tick.
   (If it hasn't run yet, open it and click **Run workflow**.)

## 4. Verify the domain with GitHub (do this before connecting it)
This stops anyone else from pointing their own GitHub Pages site at yasunagaoscar.com.
1. On GitHub, open your profile picture → **Settings → Pages → Add a domain**, and enter `yasunagaoscar.com`.
2. GitHub shows a TXT record name and value. Add it in Cloudflare under **DNS → Records**.
3. Wait a few minutes, then click **Verify** on GitHub.

## 5. Connect the domain
1. Still in **Settings → Pages**, type `yasunagaoscar.com` under **Custom domain** and save.
2. At your registrar, add these DNS records:
   - Four `A` records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One `CNAME` record for `www` pointing to `oscaryas.github.io`
   On Cloudflare, set these records to **DNS only** (grey cloud), not proxied.
3. Wait for the DNS check in Settings → Pages to pass (minutes to a few hours), then tick **Enforce HTTPS**.

Check GitHub's "Managing a custom domain for your GitHub Pages site" guide if the IP addresses above have changed.

## Updating the site later
Edit the files and push. The site rebuilds itself in about a minute.

| To change | Edit |
|---|---|
| Sidebar name, photo, links | `content/profile.json`, `public/photo.jpg` |
| Research | `content/research.json`, images in `public/research/` |
| Blog posts | Markdown files in `content/posts/` |
| Library | `content/library.json` |
| Teaching/Fieldbuilding, LLM Test | `views/teaching.html`, `views/llm-test.html` |
| Domain, booking link, email, repo link | `content/site.json` |

To preview locally: `npm run build`, then open the `dist/` folder with any static server
(for example `npx serve dist`).
