# Solward website

Static site, no build step. Every file sits at the top level (no folders), so it uploads cleanly through the GitHub web uploader.

## Files
```
index.html        Home                 /
residential.html  Residential          /residential
commercial.html   Commercial           /commercial
about.html        About                /about
contact.html      Contact              /contact
proposal.html     Get a free quote     /proposal
privacy.html      Privacy policy       /privacy
finance.html      Finance options      /finance
learn.html        Learn hub            /learn
(6 article pages) why-go-solar, where-solar-is-going, solar-and-batteries, how-home-solar-works, is-your-home-right-for-solar, solar-for-business
home-packages.html / commercial-packages.html   Small, Medium, Large
404.html          Not-found page
pixel.js          Meta Pixel (ID 982359091595847), loaded by every page
config.js         Site settings: the form address goes here
style.css         All styling, shared by every page
app.js            All behaviour, shared by every page
logo.png, symbol.png, og.png, favicon.ico, icon-*.png, apple-touch-icon.png
robots.txt, sitemap.xml, vercel.json
```
Vercel serves `about.html` at `/about` (clean URLs are on in `vercel.json`).

## Capturing leads
The proposal form sends each brief to a Formspree form, which emails it to you and keeps a copy.
1. Create a free account at formspree.io and make a new form. Set the email address(es) leads should go to.
2. Copy the form address. It looks like `https://formspree.io/f/abcdwxyz` (just the ID, `abcdwxyz`, also works).
3. Open `config.js` (the update zip does NOT include it, so it never overwrites yours) in GitHub, click the pencil, paste the address between the quotes after `formEndpoint:`, and commit.
4. Send a test enquiry from the live site and check the inbox (and the spam folder).

While `formEndpoint` is empty the form falls back to opening the visitor's email app, so nothing breaks.
Formspree's free plan covers 50 submissions a month and keeps them in its dashboard for 30 days, so keep the notification emails as your record, or move to a paid plan as volume grows.

## Making changes
- Text: open the page's `.html` file and search for the words.
- Look and feel across the whole site: `style.css`.
- Replace a logo: overwrite `logo.png` with a file of the same name.
- Nav and footer repeat in every `.html` file. A change to them needs making in each one.
- Upload changed files (Add file, Upload files) and commit. Vercel redeploys in about a minute. Upload files, never the zip.

## Before announcing
- Replace `hello@solward.co.nz` (search all pages and `config.js`) with a monitored inbox
- Have the wording on `privacy.html` checked by someone qualified
- Confirm the "licensed electrician" wording is accurate for how installs are carried out
- Submit `https://solward.co.nz/sitemap.xml` in Google Search Console

## Keeping facts current
- Bank figures on `finance.html` were checked on 20 October 2026. Update the `finance` page when lenders change terms.
- Package sizes and inclusions are in `home-packages.html` and `commercial-packages.html`. Confirm them against what Solward offers.
- Phone 09 215 7434 and Instagram are set in the nav and footer of every page.
