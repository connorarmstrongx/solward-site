# Solward website

Static site, five pages, no build step. Every file sits at the top level (no folders), so it uploads cleanly through the GitHub web uploader.

## Files
```
index.html       Home                 /
residential.html Residential          /residential
commercial.html  Commercial           /commercial
about.html       About                /about
proposal.html    Start a proposal     /proposal
404.html         Not-found page
style.css        All styling, shared by every page
app.js           All behaviour, shared by every page
logo.png         Official logo, background removed
symbol.png       Symbol only, used as the faint background motif
og.png, favicon.ico, icon-*.png, apple-touch-icon.png
robots.txt, sitemap.xml, vercel.json
```
Vercel serves `about.html` at `/about` (clean URLs are switched on in `vercel.json`).

## Making changes
- Text: open the page's `.html` file and search for the words.
- Look and feel across the whole site: `style.css`.
- Replace a logo: overwrite `logo.png` with a file of the same name.
- Nav and footer are repeated in each page. A change to them needs making in all six `.html` files.

## Updating the live site
Upload changed files to the repository (Add file, Upload files) and commit. Vercel redeploys in about a minute. Always upload files, never the zip itself.

## Checklist before announcing
- Replace `hello@solward.co.nz` (search all pages) with a monitored inbox
- Confirm the "licensed electrician" wording is accurate for how installs are carried out
- Submit `https://solward.co.nz/sitemap.xml` in Google Search Console
