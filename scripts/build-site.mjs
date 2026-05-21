import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  industries,
  processSteps,
  proofPoints,
  resources,
  services,
  site
} from "../src/content/site.mjs";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");

function assertInsideRoot(target) {
  const resolved = path.resolve(target);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error(`Refusing to write outside the project root: ${resolved}`);
  }
  return resolved;
}

function cleanDist() {
  assertInsideRoot(distDir);
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });
}

function copyDir(from, to) {
  assertInsideRoot(to);
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(source, target);
    } else {
      fs.copyFileSync(source, target);
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function stripTags(value) {
  return String(value).replace(/<[^>]+>/g, "");
}

function absoluteUrl(route = "/") {
  const base = site.url.replace(/\/$/, "");
  return `${base}${route}`;
}

function imgUrl(src) {
  if (src.startsWith("http")) return src;
  return `${site.url.replace(/\/$/, "")}${src}`;
}

function outPath(route) {
  const normalized = route === "/" ? "" : route.replace(/^\/|\/$/g, "");
  return path.join(distDir, normalized, "index.html");
}

function writePage(route, html) {
  const file = outPath(route);
  assertInsideRoot(file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function icon(name) {
  const attrs =
    'class="icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"';
  const shared = 'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    flow: `<svg ${attrs}><path ${shared} d="M24 8v8m0 16v8M12 16h24v8H12zM8 36h12v8H8zM28 36h12v8H28zM14 24v5h20v5"/></svg>`,
    gear: `<svg ${attrs}><path ${shared} d="M24 16a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z"/><path ${shared} d="M24 6v6M24 36v6M8.4 15l5.2 3M34.4 30l5.2 3M8.4 33l5.2-3M34.4 18l5.2-3M12 24H6M42 24h-6"/></svg>`,
    team: `<svg ${attrs}><path ${shared} d="M18 22a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM30 22a5 5 0 1 0 0-10"/><path ${shared} d="M8 38c1.5-6 5-10 10-10s8.5 4 10 10M28 29c4.8.6 8 4 9.5 9"/></svg>`,
    document: `<svg ${attrs}><path ${shared} d="M14 6h14l8 8v28H14z"/><path ${shared} d="M28 6v10h8M20 24h12M20 31h12M20 38h8"/></svg>`,
    chart: `<svg ${attrs}><path ${shared} d="M10 40h30M14 34V22M24 34V12M34 34V18"/></svg>`,
    check: `<svg ${attrs}><circle ${shared} cx="24" cy="24" r="16"/><path ${shared} d="m16 24 5 5 11-12"/></svg>`,
    scales: `<svg ${attrs}><path ${shared} d="M24 8v32M12 16h24M24 12l-10 4 10 4 10-4-10-4Z"/><path ${shared} d="M13 16 7 29h12l-6-13ZM35 16l-6 13h12l-6-13Z"/><path ${shared} d="M7 29c1 4 11 4 12 0M29 29c1 4 11 4 12 0"/></svg>`,
    stethoscope: `<svg ${attrs}><path ${shared} d="M14 8v12a8 8 0 1 0 16 0V8"/><path ${shared} d="M30 20v8a8 8 0 0 0 16 0v-3"/><circle ${shared} cx="43" cy="22" r="3"/><path ${shared} d="M10 8h8M26 8h8"/></svg>`,
    home: `<svg ${attrs}><path ${shared} d="M8 24 24 10l16 14"/><path ${shared} d="M13 22v18h22V22"/><path ${shared} d="M20 40V28h8v12"/></svg>`,
    calculator: `<svg ${attrs}><rect ${shared} x="12" y="6" width="24" height="36" rx="3"/><path ${shared} d="M18 14h12M18 23h2M24 23h2M30 23h2M18 30h2M24 30h2M30 30h2M18 36h2M24 36h8"/></svg>`,
    people: `<svg ${attrs}><path ${shared} d="M18 22a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM31 23a5 5 0 1 0 0-10"/><path ${shared} d="M7 39c1.4-7 5.3-11 11-11s9.6 4 11 11M30 29c5 .5 8.5 4 10 10"/></svg>`,
    folder: `<svg ${attrs}><path ${shared} d="M6 14h14l4 5h18v19H6z"/><path ${shared} d="M6 19h36"/></svg>`
  };
  return icons[name] || icons.check;
}

function smallIcon(type) {
  const shared =
    'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const map = {
    arrow: `<svg width="18" height="18" ${shared}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>`,
    calendar: `<svg width="20" height="20" ${shared}><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"/></svg>`,
    mail: `<svg width="20" height="20" ${shared}><path d="M4 4h16v16H4z"/><path d="m4 7 8 6 8-6"/></svg>`,
    menu: `<svg width="22" height="22" ${shared}><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
    check: `<svg width="16" height="16" ${shared}><path d="m5 12 4 4L19 6"/></svg>`
  };
  return map[type];
}

function header() {
  const navItems = site.nav
    .map((item) => `<a href="${item.href}">${escapeHtml(item.label)}</a>`)
    .join("");
  return `<header class="site-header">
    <div class="header-inner">
      <a class="brand" href="/" aria-label="${escapeHtml(site.name)} home">
        <span class="brand-mark">MRG</span>
        <span class="brand-text">
          <span class="brand-name">${escapeHtml(site.name)}</span>
          <span class="brand-sub">${escapeHtml(site.acronymMeaning)}</span>
        </span>
      </a>
      <nav class="site-nav" data-site-nav aria-label="Primary navigation">
        ${navItems}
        <a class="button nav-cta" href="${site.primaryCta.href}">${escapeHtml(site.primaryCta.label)}</a>
      </nav>
      <a class="button header-cta" href="${site.primaryCta.href}">${escapeHtml(site.primaryCta.label)}</a>
      <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" data-menu-toggle>
        ${smallIcon("menu")}
      </button>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="footer-inner">
      <a class="brand" href="/" aria-label="${escapeHtml(site.name)} home">
        <span class="brand-mark">MRG</span>
        <span class="brand-text">
          <span class="brand-name">${escapeHtml(site.name)}</span>
          <span class="brand-sub">${escapeHtml(site.acronymMeaning)}</span>
        </span>
      </a>
      <div class="footer-links">
        ${site.nav.map((item) => `<a href="${item.href}">${escapeHtml(item.label)}</a>`).join("")}
        <span>&copy; ${escapeHtml(site.foundedYear)} ${escapeHtml(site.legalName)}. All rights reserved.</span>
      </div>
    </div>
  </footer>`;
}

function breadcrumb(items) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href)
    }))
  };
  const html = `<nav class="breadcrumb" aria-label="Breadcrumb">${items
    .map((item, index) => {
      if (index === items.length - 1) return `<span>${escapeHtml(item.name)}</span>`;
      return `<a href="${item.href}">${escapeHtml(item.name)}</a> / `;
    })
    .join("")}</nav>`;
  return { html, json };
}

function baseSchemas(route) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${absoluteUrl("/") }#organization`,
      name: site.name,
      alternateName: site.acronymMeaning,
      legalName: site.legalName,
      url: absoluteUrl("/"),
      logo: imgUrl("/assets/logo.svg"),
      image: imgUrl(site.defaultImage),
      description: site.description,
      email: site.email,
      areaServed: ["United States", "Florida"],
      address: {
        "@type": "PostalAddress",
        addressRegion: "FL",
        addressCountry: "US"
      },
      knowsAbout: [
        "Managed business operations",
        "Workflow organization",
        "Business process documentation",
        "Workflow automation",
        "Delegated operations support",
        "AI-assisted operations",
        "Client intake workflows",
        "Document management"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${absoluteUrl("/") }#website`,
      name: site.name,
      url: absoluteUrl("/"),
      publisher: { "@id": `${absoluteUrl("/") }#organization` },
      inLanguage: "en-US"
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${absoluteUrl(route)}#webpage`,
      url: absoluteUrl(route),
      isPartOf: { "@id": `${absoluteUrl("/") }#website` },
      about: { "@id": `${absoluteUrl("/") }#organization` },
      inLanguage: "en-US"
    }
  ];
}

function pageShell({
  route,
  title,
  description,
  keywords = "",
  image = site.defaultImage,
  children,
  schemas = []
}) {
  const jsonLd = [...baseSchemas(route), ...schemas]
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ""}
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${absoluteUrl(route)}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(site.name)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${absoluteUrl(route)}">
  <meta property="og:image" content="${imgUrl(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${imgUrl(image)}">
  <link rel="preload" as="image" href="/assets/images/hero-operations.webp" type="image/webp">
  <link rel="stylesheet" href="/assets/styles.css">
  ${jsonLd}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${header()}
  <main id="main">
    ${children}
  </main>
  ${footer()}
  <script src="/assets/main.js" defer></script>
</body>
</html>`;
}

function serviceCard(service) {
  return `<article class="service-card">
    ${icon(service.icon)}
    <h3>${escapeHtml(service.shortTitle)}</h3>
    <p class="muted">${escapeHtml(service.summary)}</p>
    <a class="card-link" href="/services/${service.slug}/">Learn more ${smallIcon("arrow")}</a>
  </article>`;
}

function industryLink(industry) {
  return `<a class="industry-link" href="/industries/${industry.slug}/">
    <span class="industry-icon">${icon(industry.icon)}</span>
    <strong>${escapeHtml(industry.title)}</strong>
  </a>`;
}

function articleCard(article) {
  return `<article class="article-card">
    <div class="article-meta">${escapeHtml(article.category)}</div>
    <h3>${escapeHtml(article.title)}</h3>
    <p class="muted">${escapeHtml(article.summary)}</p>
    <a class="card-link" href="/resources/${article.slug}/">Read more ${smallIcon("arrow")}</a>
  </article>`;
}

function faqSection(faqs) {
  return `<div class="faq">
    ${faqs
      .map(
        (item) => `<details>
          <summary>${escapeHtml(item.q)}</summary>
          <p>${escapeHtml(item.a)}</p>
        </details>`
      )
      .join("")}
  </div>`;
}

function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };
}

function serviceSchema(service, route) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: { "@id": `${absoluteUrl("/") }#organization` },
    areaServed: "United States",
    serviceType: service.title,
    url: absoluteUrl(route)
  };
}

function renderContactForm() {
  return `<form class="contact-form" data-contact-form data-contact-email="${escapeHtml(site.email)}">
    <label>First Name
      <input name="firstName" autocomplete="given-name" required>
    </label>
    <label>Last Name
      <input name="lastName" autocomplete="family-name" required>
    </label>
    <label>Business Email
      <input type="email" name="email" autocomplete="email" required>
    </label>
    <label>Phone Number
      <input type="tel" name="phone" autocomplete="tel">
    </label>
    <label>Company Name
      <input name="company" autocomplete="organization">
    </label>
    <label>Industry
      <select name="industry">
        <option value="">Select one</option>
        ${industries.map((item) => `<option>${escapeHtml(item.title)}</option>`).join("")}
      </select>
    </label>
    <label class="full">What are your biggest operational challenges?
      <textarea name="message" required></textarea>
    </label>
    <p class="form-status full" data-form-status aria-live="polite"></p>
    <button class="button full" type="submit">Submit Request</button>
  </form>`;
}

function renderHome() {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "MRG Guided Solutions services",
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: service.title,
          url: absoluteUrl(`/services/${service.slug}/`)
        }
      }))
    }
  ];
  return pageShell({
    route: "/",
    title: "MRG Guided Solutions | Managed Business Operations and Automation Support",
    description:
      "MRG Guided Solutions helps busy companies organize workflows, automate repetitive work, and delegate operations so the business can run without everything depending on the owner.",
    keywords:
      "managed business operations, workflow organization, business automation, delegated operations support, AI assisted operations, small business systems",
    schemas,
    children: `<section class="hero">
      <div class="hero-grid">
        <div class="hero-copy">
          <h1>The operating support busy companies wish they already had.</h1>
          <p class="lead">MRG helps you organize the work, automate the repeatable parts, and build support your team can run.</p>
          <div class="hero-actions">
            <a class="button" href="/contact/">${escapeHtml(site.primaryCta.label)} ${smallIcon("calendar")}</a>
            <a class="button secondary" href="/services/">Explore Services ${smallIcon("arrow")}</a>
          </div>
        </div>
        <div class="hero-media" aria-label="Organized operations workspace with workflow board, documents, and dashboard">
          <img class="hero-image" src="/assets/images/hero-operations.webp" alt="Organized business operations workspace with workflow board, documents, and dashboard">
          <div class="hero-note">
            <strong>Managed Results Group</strong>
            <p class="muted">Clear workflows. Practical automation. Reliable support.</p>
          </div>
        </div>
      </div>
    </section>
    <section class="quick-answer" aria-labelledby="quick-answer-title">
      <div class="container">
        <h2 id="quick-answer-title">Quick Answer</h2>
        <p>MRG Guided Solutions is a managed operations partner for busy service businesses. MRG turns scattered work into systems your team can run.</p>
      </div>
    </section>
    <section class="section soft" id="services">
      <div class="container">
        <div class="section-heading">
          <h2>Services</h2>
          <p class="muted">Focused support for the work that keeps the business moving.</p>
        </div>
        <div class="service-grid service-grid-six">${services.map(serviceCard).join("")}</div>
      </div>
    </section>
    <section class="section" id="how-it-works">
      <div class="container">
        <div class="section-heading">
          <h2>How It Works</h2>
          <p class="muted">From messy process to repeatable system.</p>
        </div>
        <div class="process">
          ${processSteps
            .map(
              (step) => `<article class="process-step">
                <span class="step-number">${escapeHtml(step.number)}</span>
                <h3>${escapeHtml(step.title)}</h3>
                <p class="muted">${escapeHtml(step.text)}</p>
              </article>`
            )
            .join("")}
        </div>
      </div>
    </section>
    <section class="section soft" id="industries">
      <div class="container">
        <div class="section-heading">
          <h2>Industries Served</h2>
          <p class="muted">Built for service businesses with clients, documents, details, and follow-up.</p>
        </div>
        <div class="industry-list">${industries.map(industryLink).join("")}</div>
      </div>
    </section>
    <section class="section">
      <div class="container split">
        <div>
          <div class="section-heading left">
            <h2>Why MRG</h2>
            <p class="muted">Simple systems. Clear handoffs. Support that can scale.</p>
          </div>
          <div class="proof-list">
            ${proofPoints
              .map(
                (point) => `<div class="proof-item">
                  <span class="check-icon">${smallIcon("check")}</span>
                  <div>
                    <strong>${escapeHtml(point.title)}</strong>
                    <p class="muted">${escapeHtml(point.text)}</p>
                  </div>
                </div>`
              )
              .join("")}
          </div>
        </div>
        <img class="section-image" src="/assets/images/team-operations.webp" alt="Business operations team reviewing workflow documents together" loading="lazy">
      </div>
    </section>
    <section class="section soft">
      <div class="container">
        <div class="section-heading left">
          <h2>Insights and Resources</h2>
          <p class="muted">Short guides for cleaner workflows and better delegation.</p>
        </div>
        <div class="article-grid">${resources.map(articleCard).join("")}</div>
      </div>
    </section>
    <section class="section teal">
      <div class="container cta-band">
        <div class="cta-copy">
          <h2>Ready for a business that feels easier to run?</h2>
          <p class="muted">Start with a practical review of what needs structure, support, or automation.</p>
          <div>
            <p><strong>${smallIcon("calendar")} Schedule a Business Review</strong></p>
            <p class="muted">A focused first conversation.</p>
          </div>
          <div>
            <p><strong>${smallIcon("mail")} Email Us</strong></p>
            <p class="muted">${escapeHtml(site.email)}</p>
          </div>
        </div>
        ${renderContactForm()}
      </div>
    </section>`
  });
}

function renderServicesIndex() {
  const crumbs = breadcrumb([
    { name: "Home", href: "/" },
    { name: "Services", href: "/services/" }
  ]);
  return pageShell({
    route: "/services/",
    title: "Managed Operations Services | MRG Guided Solutions",
    description:
      "Explore MRG services for workflow organization, automation, delegated operations support, document management, reporting, and process consulting.",
    keywords:
      "managed operations services, workflow organization services, business automation support, delegated operations support",
    schemas: [crumbs.json],
    children: `<section class="subhero">
      <div class="container narrow">
        ${crumbs.html}
        <h1>Managed operations services for businesses that have outgrown doing everything manually.</h1>
        <p class="lead">MRG helps organize the work, build the systems, and support the team so your business can scale with less owner dependency.</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="service-grid">${services.map(serviceCard).join("")}</div>
      </div>
    </section>`
  });
}

function renderServicePage(service) {
  const route = `/services/${service.slug}/`;
  const crumbs = breadcrumb([
    { name: "Home", href: "/" },
    { name: "Services", href: "/services/" },
    { name: service.title, href: route }
  ]);
  const schemas = [crumbs.json, serviceSchema(service, route), faqSchema(service.faq)];
  return pageShell({
    route,
    title: `${service.title} | MRG Guided Solutions`,
    description: service.description,
    keywords: service.keywords,
    schemas,
    children: `<section class="subhero">
      <div class="container narrow">
        ${crumbs.html}
        <h1>${escapeHtml(service.title)}</h1>
        <p class="lead">${escapeHtml(service.description)}</p>
        <div class="hero-actions">
          <a class="button" href="/contact/">Schedule a Business Review ${smallIcon("calendar")}</a>
          <a class="button secondary" href="/services/">View All Services ${smallIcon("arrow")}</a>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container page-grid">
        <div class="content-block">
          <h2>What MRG Helps With</h2>
          <p>${escapeHtml(service.summary)}</p>
          <h2>What Is Included</h2>
          <ul class="list-panel">${service.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <h2>Expected Outcomes</h2>
          <ul class="list-panel">${service.outcomes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <h2>Questions About ${escapeHtml(service.shortTitle)}</h2>
          ${faqSection(service.faq)}
        </div>
        <aside class="aside-panel">
          ${icon(service.icon)}
          <h3>Best for</h3>
          <p class="muted">Businesses where recurring work, follow-up, documentation, or internal handoffs are slowing growth.</p>
          <a class="button" href="/contact/">Start With a Business Review</a>
        </aside>
      </div>
    </section>`
  });
}

function renderIndustriesIndex() {
  const crumbs = breadcrumb([
    { name: "Home", href: "/" },
    { name: "Industries", href: "/industries/" }
  ]);
  return pageShell({
    route: "/industries/",
    title: "Industries Served | MRG Guided Solutions",
    description:
      "MRG supports service businesses, law firms, clinics, real estate teams, accounting firms, nonprofits, and document-heavy companies.",
    keywords:
      "operations support for service businesses, business workflow support industries, managed operations for small business",
    schemas: [crumbs.json],
    children: `<section class="subhero">
      <div class="container narrow">
        ${crumbs.html}
        <h1>Operations help for service businesses where details matter.</h1>
        <p class="lead">MRG is general by design, but strongest where businesses depend on intake, documents, follow-up, scheduling, status updates, and team handoffs.</p>
      </div>
    </section>
    <section class="section soft">
      <div class="container">
        <div class="service-grid">
          ${industries
            .map(
              (industry) => `<article class="industry-panel">
                <span class="industry-icon">${icon(industry.icon)}</span>
                <h3>${escapeHtml(industry.title)}</h3>
                <p class="muted">${escapeHtml(industry.summary)}</p>
                <a class="card-link" href="/industries/${industry.slug}/">Explore ${escapeHtml(industry.title)} ${smallIcon("arrow")}</a>
              </article>`
            )
            .join("")}
        </div>
      </div>
    </section>`
  });
}

function renderIndustryPage(industry) {
  const route = `/industries/${industry.slug}/`;
  const crumbs = breadcrumb([
    { name: "Home", href: "/" },
    { name: "Industries", href: "/industries/" },
    { name: industry.title, href: route }
  ]);
  return pageShell({
    route,
    title: `${industry.title} Operations Support | MRG Guided Solutions`,
    description: industry.summary,
    keywords: industry.keywords,
    schemas: [crumbs.json],
    children: `<section class="subhero">
      <div class="container narrow">
        ${crumbs.html}
        <h1>${escapeHtml(industry.title)} Operations Support</h1>
        <p class="lead">${escapeHtml(industry.summary)}</p>
        <div class="hero-actions">
          <a class="button" href="/contact/">Schedule a Business Review ${smallIcon("calendar")}</a>
          <a class="button secondary" href="/services/">View Services ${smallIcon("arrow")}</a>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container page-grid">
        <div class="content-block">
          <h2>Common Operational Challenges</h2>
          <ul class="list-panel">${industry.painPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <h2>How MRG Can Help</h2>
          <ul class="list-panel">${industry.solutions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <h2>Relevant Services</h2>
          <div class="service-grid">${services.slice(0, 3).map(serviceCard).join("")}</div>
        </div>
        <aside class="aside-panel">
          <span class="industry-icon">${icon(industry.icon)}</span>
          <h3>Good fit when</h3>
          <p class="muted">Your team is busy, the work is repeatable, and better systems would make the business easier to run.</p>
          <a class="button" href="/contact/">Talk With MRG</a>
        </aside>
      </div>
    </section>`
  });
}

function renderResourcesIndex() {
  const crumbs = breadcrumb([
    { name: "Home", href: "/" },
    { name: "Resources", href: "/resources/" }
  ]);
  return pageShell({
    route: "/resources/",
    title: "Business Operations Resources | MRG Guided Solutions",
    description:
      "Read MRG resources on workflow documentation, business automation, owner bottlenecks, delegated operations, and scalable systems.",
    keywords:
      "business operations resources, workflow documentation guide, automation ideas for service businesses, owner bottleneck guide",
    schemas: [crumbs.json],
    children: `<section class="subhero">
      <div class="container narrow">
        ${crumbs.html}
        <h1>Resources for building a business that runs with less chaos.</h1>
        <p class="lead">Plain-English articles for owners and managers who want clearer workflows, better delegation, and practical automation.</p>
      </div>
    </section>
    <section class="section soft">
      <div class="container">
        <div class="article-grid">${resources.map(articleCard).join("")}</div>
      </div>
    </section>`
  });
}

function renderArticlePage(article) {
  const route = `/resources/${article.slug}/`;
  const crumbs = breadcrumb([
    { name: "Home", href: "/" },
    { name: "Resources", href: "/resources/" },
    { name: article.title, href: route }
  ]);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.date,
    dateModified: article.date,
    author: { "@id": `${absoluteUrl("/") }#organization` },
    publisher: { "@id": `${absoluteUrl("/") }#organization` },
    image: imgUrl(site.defaultImage),
    mainEntityOfPage: absoluteUrl(route)
  };
  return pageShell({
    route,
    title: `${article.title} | MRG Guided Solutions`,
    description: article.summary,
    keywords: article.keywords,
    schemas: [crumbs.json, articleSchema],
    children: `<section class="subhero">
      <div class="container narrow">
        ${crumbs.html}
        <p class="article-meta">${escapeHtml(article.category)}</p>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="lead">${escapeHtml(article.summary)}</p>
      </div>
    </section>
    <section class="section">
      <article class="resource-article">
        ${article.body
          .map(
            (block) => `<section>
              <h2>${escapeHtml(block.heading)}</h2>
              <p>${escapeHtml(block.text)}</p>
            </section>`
          )
          .join("")}
        <section class="feature-card">
          <h2>Need this built for your business?</h2>
          <p class="muted">MRG can help document the workflow, set up the system, and create the support routine your team needs.</p>
          <div class="cta-actions">
            <a class="button" href="/contact/">Schedule a Business Review</a>
            <a class="button secondary" href="/resources/">More Resources</a>
          </div>
        </section>
      </article>
    </section>`
  });
}

function renderAbout() {
  const crumbs = breadcrumb([
    { name: "Home", href: "/" },
    { name: "About", href: "/about/" }
  ]);
  return pageShell({
    route: "/about/",
    title: "About MRG Guided Solutions | Managed Results Group",
    description:
      "MRG Guided Solutions, also known as Managed Results Group, helps busy businesses build operations that can be managed, delegated, and scaled.",
    keywords:
      "Managed Results Group, MRG Guided Solutions, managed operations company, business operations partner",
    schemas: [crumbs.json],
    children: `<section class="subhero">
      <div class="container narrow">
        ${crumbs.html}
        <h1>MRG stands for Managed Results Group.</h1>
        <p class="lead">MRG Guided Solutions exists to help business owners move from scattered, owner-dependent operations to clear systems that a capable team can run.</p>
      </div>
    </section>
    <section class="section">
      <div class="container split">
        <div class="content-block">
          <h2>Built for busy companies</h2>
          <p>Many service businesses grow faster than their systems. The owner becomes the backup plan for every question, every exception, every missed detail, and every important handoff.</p>
          <p>MRG helps change that. We organize the workflow, document the process, set up practical tools, and help create the support structure needed for consistent delivery.</p>
          <h2>General by design</h2>
          <p>MRG is not limited to one industry. The model fits businesses where client work, documents, follow-up, scheduling, communication, and recurring administration need to become more repeatable.</p>
        </div>
        <img class="section-image" src="/assets/images/team-operations.webp" alt="MRG operations team reviewing workflow plans" loading="lazy">
      </div>
    </section>`
  });
}

function renderContact() {
  const crumbs = breadcrumb([
    { name: "Home", href: "/" },
    { name: "Contact", href: "/contact/" }
  ]);
  return pageShell({
    route: "/contact/",
    title: "Schedule a Business Review | MRG Guided Solutions",
    description:
      "Contact MRG Guided Solutions to schedule a business review for workflow organization, automation, delegation, and managed business support.",
    keywords:
      "book operations review, business operations consultation, workflow audit, managed operations support",
    schemas: [crumbs.json],
    children: `<section class="subhero">
      <div class="container narrow">
        ${crumbs.html}
        <h1>Schedule a Business Review.</h1>
        <p class="lead">Share where your business needs more structure, support, or consistency. We will look for practical ways to organize the work, reduce manual effort, delegate recurring tasks, and make the business easier to manage.</p>
      </div>
    </section>
    <section class="section teal">
      <div class="container cta-band">
        <div class="cta-copy">
          <h2>Start with the work that feels hardest to hand off.</h2>
          <p class="muted">Good operations begin with visibility. Use the form to share what is currently messy, manual, delayed, or too dependent on you.</p>
          <p><strong>Email:</strong> ${escapeHtml(site.email)}</p>
        </div>
        ${renderContactForm()}
      </div>
    </section>`
  });
}

function writeRobots() {
  const robots = `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
  fs.writeFileSync(path.join(distDir, "robots.txt"), robots);
}

function routes() {
  return [
    "/",
    "/services/",
    ...services.map((item) => `/services/${item.slug}/`),
    "/industries/",
    ...industries.map((item) => `/industries/${item.slug}/`),
    "/resources/",
    ...resources.map((item) => `/resources/${item.slug}/`),
    "/about/",
    "/contact/"
  ];
}

function writeSitemap() {
  const urls = routes()
    .map(
      (route) => `<url>
  <loc>${absoluteUrl(route)}</loc>
  <lastmod>2026-05-21</lastmod>
  <changefreq>${route === "/" ? "weekly" : "monthly"}</changefreq>
  <priority>${route === "/" ? "1.0" : route.includes("/resources/") ? "0.7" : "0.8"}</priority>
</url>`
    )
    .join("\n");
  fs.writeFileSync(
    path.join(distDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
  );
}

function writeLlmsTxt() {
  const serviceLines = services.map((service) => `- ${service.title}: ${service.summary}`).join("\n");
  const industryLines = industries.map((industry) => `- ${industry.title}: ${industry.summary}`).join("\n");
  const resourceLines = resources
    .map((article) => `- ${article.title}: ${absoluteUrl(`/resources/${article.slug}/`)}`)
    .join("\n");
  const llms = `# ${site.name}

${site.name}, also known as ${site.acronymMeaning}, is a managed business operations company based in Florida and serving businesses in the United States.

## What MRG Does

MRG helps busy companies organize workflows, automate repetitive work, document operating procedures, manage documents and data, improve reporting, and delegate recurring operational tasks to trained support.

## Best-Fit Clients

MRG is best for small and midsize service businesses where intake, forms, files, client communication, scheduling, follow-up, and handoffs create operational drag.

## Services

${serviceLines}

## Industries

${industryLines}

## Helpful Pages

- Home: ${absoluteUrl("/")}
- Services: ${absoluteUrl("/services/")}
- Industries: ${absoluteUrl("/industries/")}
- Resources: ${absoluteUrl("/resources/")}
- Contact: ${absoluteUrl("/contact/")}

## Resource Articles

${resourceLines}

## Contact

Email: ${site.email}
`;
  fs.writeFileSync(path.join(distDir, "llms.txt"), llms);
}

function writePages() {
  writePage("/", renderHome());
  writePage("/services/", renderServicesIndex());
  services.forEach((service) => writePage(`/services/${service.slug}/`, renderServicePage(service)));
  writePage("/industries/", renderIndustriesIndex());
  industries.forEach((industry) => writePage(`/industries/${industry.slug}/`, renderIndustryPage(industry)));
  writePage("/resources/", renderResourcesIndex());
  resources.forEach((article) => writePage(`/resources/${article.slug}/`, renderArticlePage(article)));
  writePage("/about/", renderAbout());
  writePage("/contact/", renderContact());
}

cleanDist();
copyDir(path.join(srcDir, "assets"), path.join(distDir, "assets"));
writePages();
writeRobots();
writeSitemap();
writeLlmsTxt();

const pageCount = routes().length;
console.log(`Built ${pageCount} pages into ${path.relative(root, distDir)}.`);
