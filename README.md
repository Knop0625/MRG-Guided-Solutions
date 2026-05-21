# MRG Guided Solutions Website

This is a static, SEO-focused website for **MRG Guided Solutions / Managed Results Group**.

The important business copy lives in:

- `src/content/site.mjs`

The build script turns that content into static HTML pages in:

- `dist/`

## How to Update

Edit `src/content/site.mjs` to add or revise:

- Services
- Industries
- Resource articles
- FAQ answers
- Contact details
- Site title and domain

Then run:

```powershell
node scripts/build-site.mjs
```

The finished site is in `dist/` and can be hosted on Netlify, Vercel, Cloudflare Pages, GitHub Pages, or most standard web hosts.

To preview locally:

```powershell
node scripts/serve.mjs
```

Then open `http://localhost:4173`.

## SEO Files Included

- `sitemap.xml`
- `robots.txt`
- `llms.txt`
- JSON-LD structured data for the organization, services, articles, breadcrumbs, and FAQs
- Static HTML content for search engines and AI answer engines

Before launch, update the final domain and contact email in `src/content/site.mjs`.

## Deploy With Cloudflare Pages

Use Cloudflare Pages with Git integration so every GitHub update can deploy automatically.

Cloudflare Pages settings:

- Framework preset: `None`
- Build command: `node scripts/build-site.mjs`
- Build output directory: `dist`
- Root directory: leave blank unless this project is inside a subfolder of a larger repo
- Production branch: `main`

After deployment, add the custom domain:

- `mrguidedsolutions.com`
- `www.mrguidedsolutions.com`

The site source is in `src/`. The `dist/` folder is generated during deployment and is intentionally ignored by Git.
