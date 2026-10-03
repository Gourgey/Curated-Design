# Curated Design — Content Guide

Where every piece of site content lives, and the rules for changing it. Content is plain JSON and Markdown in this repository; edit the file, run `npm run check`, and commit. Netlify rebuilds the live site from `main` in a minute or two.

## Quick reference

| Content | File |
|---|---|
| Studio name, email, location, site URL, default description, footer CTA | `src/content/settings.json` |
| Homepage | `src/content/pages/home.json` |
| Studio page (founder, process, focus areas) | `src/content/pages/about.json` |
| Services listing page, including its FAQs | `src/content/pages/services.json` |
| Work listing page | `src/content/pages/projects.json` |
| Contact page | `src/content/pages/contact.json` |
| One project | `src/content/projects/{slug}.md` |
| One service | `src/content/services/{slug}.md` |
| Apps: descriptions, information rows, FAQs, page metadata | `src/_data/apps.js` |
| App how-to guides | `src/_includes/apps/guides/{slug}.md` |
| App privacy, support, and terms pages | `src/_includes/apps/` and `src/apps/legal-pages.njk` |
| Company legal pages | `src/_data/legal.js` |

URLs: projects at `/work/{slug}/`, services at `/services/{slug}/`, apps at `/apps/{slug}/` (with `/guide/`, `/privacy/`, `/support/`, and `/terms/` beneath).

Generated from these files, with no separate editing: the sitemap, `/llms.txt` (the plain-text summary for AI assistants), and the structured data in each page's `<head>`. Change the content and they follow.

---

## 1. How the site is built

- Each **project** file owns its title, kicker, images, and full case study. Wherever that project appears (homepage card, listing card, project page), the same data is used.
- The **homepage** does not store project images or titles. It lists which projects and services to feature, by slug.
- **FAQs** on the Services page and on each app page are visible on the page and also published as FAQ structured data. Keep answers factual: search engines and AI assistants repeat them.

---

## 2. Project statuses

The `status` field takes one of three values:

| Status | Where it shows | What renders |
|---|---|---|
| `published` | Work listing, optionally homepage | Full project page with body, callout, extra sections, gallery carousel |
| `coming_soon` | Work listing, optionally homepage | Teaser page with hero image, lead text, optional callout, project facts. Body and gallery are hidden, and the page is `noindex`. |
| `draft` | Nowhere on the public site | The project page is not generated at all |

Switching from `coming_soon` to `published` keeps the same URL.

---

## 3. Adding a project

Duplicate an existing file in `src/content/projects/`, rename it to the new slug, and update its front matter:

- **`slug`** — lowercase with underscores; becomes `/work/{slug}/`. **Do not change it after publishing** without adding a redirect in `public/_redirects`.
- **`status`, `order`** (lower numbers first within a category), **`category`** (Residential / Hospitality / Commercial), **`showInProjects`**.
- **Card:** `kicker`, `cardImage`, `cardAlt`. The card image is reused on the homepage and the listing.
- **Hero:** `heroImage`, `heroAlt`, `subtitle`, `projectTags`.
- **Body:** `articleHeading` (defaults to "Overview"), `lead` (required when published), `body` (Markdown), `callout`, `extraSections`.
- **Sidebar:** `facts` (label/value pairs) and `asideText`.
- **Gallery** (optional, published only): a list of images with alt text, shown as a carousel.
- **Bottom CTA:** `ctaHeading`, `ctaText`.
- **SEO** (optional): `metaTitle`, `metaDescription`.
- Leave `tags` and `permalink` exactly as they are in the file you copied; the build needs them.

For a coming-soon project, `body`, `extraSections`, and the gallery can stay empty; `lead` or `summary` is required, and `statusLabel` overrides the "Coming soon" badge.

To hide a project without deleting it, set `status: draft`.

---

## 4. Featuring projects and services on the homepage

In `src/content/pages/home.json`, `collectionsSection` lists featured projects and `servicesSection.featuredServices` lists featured services, by slug, in display order. Only `published` and `coming_soon` projects can be featured. A homepage slot can override the project's card image with its own path.

---

## 5. Services

Each file in `src/content/services/` holds a service's `title`, `slug`, `status`, `order`, card (`summary`, `cardImage`, `cardAlt`), cover (`coverImage`, `coverAlt`), `intro`, `glance` rows (e.g. Timeline), `sections` (heading, `ul`/`ol` list, optional note), enquiry copy, CTA copy, and optional SEO fields.

---

## 6. Images

Put project photos in `assets/images/projects/{slug}/` and reference them as `/assets/images/projects/{slug}/photo_1.webp`. Other folders: `assets/images/curated_services/` (service cards), `assets/images/app_screenshots/`, `assets/images/logos/`.

- Use WebP (AVIF is also fine). Avoid PNG for photographs.
- Resize before adding: card images around 1600×900 px; hero and gallery images up to 2560 px wide.
- File names: lowercase, underscores or dashes, no spaces.

The build generates responsive AVIF/WebP sizes and social-share crops automatically.

---

## 7. How SEO descriptions fall back

**Project page:** the project's `metaDescription`, then `subtitle`, then `summary`, then the site-wide `description` in `settings.json`.

**Service page:** `metaDescription`, then `summary`, then `intro`, then the site-wide default.

**Top-level pages:** the page's own `metaDescription`, then the site-wide default.

Keep descriptions under about 160 characters.

---

## 8. Checks and publishing

```sh
npm run check
```

This validates content, builds the site, and checks links, metadata, app-page claims, and accessibility. The app checks in `tools/check-output.js` stop pages claiming features an app does not have (for example iCloud or a Mac version for Locis), so if one fails after a copy change, fix the copy rather than the rule, unless the app genuinely changed.

Preview locally with `npm start` (http://localhost:8080/). Commit to `main` to publish; content is versioned in git, so any change can be reverted.
