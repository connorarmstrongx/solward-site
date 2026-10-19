# Solward website

Static site, five pages, no build step and no dependencies.

## Structure
```
index.html              Home                  /
residential/index.html  Residential           /residential
commercial/index.html   Commercial            /commercial
about/index.html        About                 /about
proposal/index.html     Start a proposal      /proposal
404.html                Not-found page
assets/style.css        All styling (shared by every page)
assets/app.js           All behaviour (shared by every page)
assets/logo.png         Official logo, background removed
assets/symbol.png       Symbol only, used as the faint background motif
og.png, favicon.ico, icon-*.png, apple-touch-icon.png
robots.txt, sitemap.xml, vercel.json
```

## Making changes
- Text: open the page's `index.html` and search for the words. Each page holds only its own content.
- Look and feel across the whole site: `assets/style.css`.
- Replace a logo: overwrite `assets/logo.png` with a file of the same name.
- Nav and footer are repeated in each page. A change to them needs making in all five (and `404.html`).

## Deploying
The repository is connected to Vercel. Commit to the main branch and the site redeploys in about a minute.

## Checklist before announcing
- Replace `hello@solward.co.nz` (search all pages) with a monitored inbox
- Confirm the "licensed electrician" wording is accurate for how installs are carried out
- Add `solward.co.nz` and `www.solward.co.nz` under Vercel, Settings, Domains
- After launch, submit `https://solward.co.nz/sitemap.xml` in Google Search Console
