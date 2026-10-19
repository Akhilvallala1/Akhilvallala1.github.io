# akhil.vallala portfolio

Static site on GitHub Pages: https://akhilvallala1.github.io

```
index.html          home page
projects/           case studies: piiguard, AgentShield, Conduit, plus an index
fonts/              self-hosted fonts (no Google Fonts request, no layout shift on load)
headshot*.webp      headshot (192 px for the page, 480 px for search and link previews)
favicon.svg, og.png tab icon and share image
robots.txt, sitemap.xml, llms.txt   instructions for search engines and AI assistants
api/                the "Ask about Akhil" service (Cloud Run) and the visitor-card Apps Script
```

The pages are generated from one source file by a small Python build script, so edits are made
there and the output is copied here.

## Live pieces

- **Redaction console:** calls the AgentShield demo API on Cloud Run (scales to zero).
- **Ask about Akhil:** `api/` on Cloud Run with Gemini Flash-Lite, rate-limited, answers only about Akhil.
- **Who's visiting? card and page-view counts:** `api/visitor_card.gs`, an Apps Script web app that
  writes to a Google Sheet. Page views are anonymous (page, referring site, phone or desktop).
  Run `turnOff` / `visitsOff` in the script editor to switch either one off.

Everything runs on free tiers; a $5/month budget alert is set on the Google Cloud project.
