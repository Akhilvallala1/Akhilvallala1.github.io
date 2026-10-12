# akhil.vallala portfolio

A single static page. No build step, no framework, no server.

```
index.html    the whole site (styles, scripts and headshot are inlined)
favicon.svg   browser tab icon
og.png        the preview image LinkedIn, Slack and iMessage show when the link is shared
```

## Deploy (pick one)

**Netlify Drop (2 minutes, no account setup beyond sign-in)**
1. Go to app.netlify.com/drop
2. Drag this whole folder onto the page
3. You get a live URL right away. Rename it under Site settings, or add a custom domain.

**Vercel**
1. Put this folder in a GitHub repo (for example `portfolio`)
2. On vercel.com, choose Add New, then Project, and import the repo
3. Framework preset: Other. No build command. Deploy.

**GitHub Pages (free, uses your GitHub username)**
1. Create a repo named `Akhilvallala1.github.io`
2. Upload these files to the root of the repo
3. Settings, then Pages, then deploy from the `main` branch
4. The site goes live at https://akhilvallala1.github.io

## After it is live

1. **Share preview.** The share image already points at https://akhilvallala1.github.io/og.png.
   If you move to a custom domain, update `og:image`, `og:url` and `canonical` in `index.html`,
   then paste the URL into linkedin.com/post-inspector to refresh the preview.
2. **Custom domain.** A domain like `akhilvallala.dev` or `akhilvallala.com` costs about
   $10 to $15 a year. Both Netlify and Vercel walk you through pointing it at the site.
3. **Add the link** to your LinkedIn Featured section, your LinkedIn contact info, your
   GitHub profile, and the header line of your resume.

## Good to know

- The "Ask anything" box only appears when the page is opened inside Claude. On your own
  domain it hides itself, and the six common questions still work for every visitor.
- To change any text, edit `index.html` and redeploy. Everything is in that one file.
