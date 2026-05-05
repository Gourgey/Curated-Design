# Curated Design — Content Guide

This guide is for the website owner. It covers everything you can edit through Decap CMS without touching code: projects, services, homepage, settings, and images. Read the section you need; you don't need to read the whole document.

## Quick reference

- **Site editor:** `https://your-site/admin/` (Decap CMS)
- **Project pages live at:** `/projects/{slug}.html`
- **Service pages live at:** `/curated_services/{slug}.html`
- **Three project statuses:** Published, Coming Soon, Draft
- **Where to add images:** Upload through any CMS image field; saved to `/assets/images/uploads/`

---

## 1. Mental model — how the site is built

The website is built from a small set of content files:

- **Projects** — one entry per project, edited under "Projects" in the CMS sidebar
- **Services** — one entry per service, under "Services"
- **Pages** — Homepage, About, Contact, and Projects-page text, under "Pages"
- **Site Settings** — studio name, email, footer CTA copy, site-wide defaults, under "Site Settings"

Each Project entry owns its title, kicker, images, and full case study. Wherever that project shows up — homepage card, listing card, project page — the same data is used. **Edit a project once and every place it appears updates.**

The homepage doesn't store project images or titles. It just lists which projects to feature.

---

## 2. Project statuses

Every project has one of three statuses:

| Status | Where it shows | What renders |
|---|---|---|
| **Published** | Projects listing, optionally homepage | Full project page with body, callout, extra sections, gallery carousel |
| **Coming Soon** | Projects listing, optionally homepage | Teaser page with hero image, lead text, optional callout, project facts. Body and gallery are intentionally hidden. |
| **Draft (hidden)** | Nowhere on the public site | The project page is not generated at all |

Switching from Coming Soon to Published is a single CMS change — the URL stays the same.

---

## 3. Adding a new published project

This is the standard workflow for a project you've finished.

1. In the CMS sidebar, click **Projects → New Project**
2. Fill in:
    - **Title** — e.g. "Sandbanks Residence"
    - **Slug** — lowercase, underscores only, no spaces. Becomes the URL: `/projects/{slug}.html`. Example: `sandbanks_residence`. **Once published, do not change the slug** unless you want the URL to break.
    - **Status** — choose "Published"
    - **Order** — a number (1, 2, 3 …). Lower numbers appear first in the Projects listing
    - **Show in Projects Listing** — leave on (default)
    - **Listing Card Width** — pick a width preset. Mix widths across projects to create rhythm in the grid
    - **Category** — Residential / Hospitality / Commercial. Determines which Projects-page section the card appears under
3. Fill in the **Card** fields:
    - **Kicker** — small label above the title (e.g. "Residential · 2026")
    - **Card Image** — the photo shown on cards. **Use this image** — it's reused on the homepage and the listing
    - **Card Image Alt Text** — describe what's in the image, briefly
4. Fill in the **Project Page Hero** fields:
    - **Hero Image** — the large image at the top of the project page
    - **Hero Image Alt Text**
    - **Subtitle** — short description shown below the title in the hero overlay
    - **Project Tags** — short chip tags (e.g. "Space planning", "Lighting"). Optional but recommended
5. Fill in the **Project Page Body** fields:
    - **Article Heading** — defaults to "Overview". Change if you prefer
    - **Lead** — opening paragraph (required for Published)
    - **Body** — the main case-study text. Markdown supported
    - **Callout** — optional highlighted block (one title + one text)
    - **Extra Sections** — optional. Each has a heading and markdown text. Use this for "Approach", "Details", etc.
6. Fill in **Facts** (optional) — key/value entries shown in the right-hand panel:
    - Examples: "Location → Marylebone, London", "Type → Residential lobby", "Year → 2026"
7. Fill in **Aside Text** (optional) — a small note above the Enquire button
8. Fill in **Gallery** (optional but encouraged):
    - **Heading** and **Text** — optional intro
    - **Images** — list of images, each with alt text. **These appear as a hero carousel on the published page**
9. **Bottom CTA** fields — heading + text for the "Discuss a project" band at the bottom
10. **SEO** (optional):
    - **Meta Title** — leave blank to use the project title
    - **Meta Description** — leave blank to fall back to Subtitle, then Summary, then the site-wide default
11. Click **Publish** in the top right

After saving, the new project page will be live at `/projects/{slug}.html` once the site rebuilds (typically a minute or two on Netlify).

---

## 4. Adding a coming-soon project

Same workflow as above, but:

1. Set **Status** to "Coming Soon"
2. Fill in:
    - **Title, Slug, Order, Category, Kicker** — same as published
    - **Card Image, Card Alt Text, Hero Image, Hero Alt Text, Subtitle** — same as published
    - **Status Label** — optional override for the badge that appears next to the title (defaults to "Coming soon")
    - **Lead** *or* **Summary** — at least one of these. Lead is preferred; if Lead is blank, Summary is used
    - **Callout** — optional. One title + text describing what's coming
    - **Facts** — optional. Often used to show "Status: Coming soon", "Year: 2026", "Type: Residential", etc.
3. **You can leave these blank** for coming-soon projects — they won't render:
    - Body
    - Extra Sections
    - Gallery
4. Save / Publish

When the project is finished:

1. Change **Status** to "Published"
2. Fill in Body, Extra Sections, Gallery as needed
3. Save

The URL stays the same.

---

## 5. Hiding a project (Draft)

To take a project off the public site without deleting it:

1. Open the project in the CMS
2. Change **Status** to "Draft — hidden from site"
3. Save

The project page is no longer generated. The project is removed from the homepage Collections grid (if featured) and from the Projects listing automatically.

To bring it back, set Status to Published or Coming Soon.

---

## 6. Removing a project entirely

If you're sure you want it gone:

1. Open the project in the CMS
2. Click the three-dot menu (top right of the editor) → **Delete entry**

This deletes the markdown file from the repository. The page is removed from the site at the next build.

If you want to be cautious, prefer **Draft** instead — the content is preserved.

---

## 7. Project ordering on the listing page

Projects are ordered within their category by the **Order** field — lower numbers first.

- The Projects page is grouped into Residential / Hospitality / Commercial sections
- Within each category, projects are sorted by Order
- A category that has no projects (all draft, or none in that category) is hidden from both the page and the pill menu automatically

If you change the Order of one project, no other projects need updating.

---

## 8. Featuring projects on the homepage

The homepage Collections section is a curated list, **not** an automatic one. To change which projects are featured:

1. CMS sidebar → **Pages → Homepage**
2. Scroll to **Homepage Collections Section**
3. **Featured Projects** is a list. For each entry:
    - **Project** — pick from the dropdown (only Published + Coming Soon projects are shown)
    - **Selected Project Image** *(optional)* — paste a path to override the card image for this homepage slot. Leave blank to use the project's Card Image
    - **Homepage Card Width** *(optional)* — Auto / Half / Third
4. Drag the items to reorder
5. Save

Same flow for **Featured Services** under "Homepage Services Section".

The homepage **Carousel** (the rotating image at the top) works the same way — it references projects by slug. Each slide has a manually-typed image path; use one of the project's existing image paths. The slug picker filters to Published + Coming Soon projects.

---

## 9. Where images go

There are two paths images can take into the site:

### A. Through the CMS (recommended for everyday use)

When you click an image-upload field in the CMS:
- The file uploads to `assets/images/uploads/` automatically
- The image path is filled in for you
- That's it — no folder management needed

This is the safest workflow.

### B. Manually placed in project folders (for project photographers)

If you (or a photographer) drop a batch of images directly into the repository, put them in:

```
assets/images/projects/{project-slug}/
```

For example, photos for the `garden_restaurant` project go in `assets/images/projects/garden_restaurant/`. Then in the CMS, instead of uploading, you can paste the path manually:

```
/assets/images/projects/garden_restaurant/photo_1.webp
```

### Image format and size guidance

- **Use WebP** for photos. AVIF is also fine. JPEG works but is larger
- **Avoid PNG** for photographs — they're 20–30× the file size for no visual benefit
- **Avoid uploading raw photos** — resize before uploading. A good target:
    - Card images: 1600×900 px
    - Hero images: 2560 px wide max
    - Gallery images: same as hero
- **File names**: lowercase, underscores or dashes, no spaces. Example: `lounge_corner.webp`

### Where to find existing images

- Project folders: `assets/images/projects/{slug}/`
- Service cards: `assets/images/curated_services/`
- Site logos: `assets/images/logos/`
- Background images: `assets/images/`

---

## 10. Editing services

Services follow the same pattern as projects, but with a simpler structure.

1. CMS sidebar → **Services → New Service** (or pick an existing one)
2. Fill in:
    - **Title, Slug, Status, Order**
    - **Summary** — short description shown on service cards (homepage)
    - **Card Image, Card Alt Text** — used on homepage service cards
    - **Cover Image, Cover Alt Text** — used as the service detail page's main image
    - **Intro** — lead paragraph below the cover image
    - **At a Glance** — quick reference list (e.g. "Timeline: 1–2 weeks")
    - **Content Sections** — each section has a heading, a list type (bulleted/numbered), and items
    - **Enquiry Heading + Text** — the form panel sidebar
    - **CTA Heading + Text** — the bottom band
    - **SEO** *(optional)* — Meta Title / Meta Description

To feature a service on the homepage:

1. CMS sidebar → **Pages → Homepage → Homepage Services Section → Featured Services**
2. Add the service slug. Drag to reorder.

---

## 11. Editing pages and settings

### Site Settings (one place to update studio details)

CMS sidebar → **Site Settings → Global Settings**

Change here:
- Studio name, email, location
- Primary CTA text + URL (used in some buttons)
- Footer CTA heading + text (default fallback for project bottom CTAs)
- **Site URL** — used as the canonical base for SEO
- **Default Meta Description** — site-wide fallback used on any page that doesn't supply its own. Keep it under 160 characters

### Page text

CMS sidebar → **Pages**

- **Homepage** — hero, carousel, featured services, featured projects, philosophy section, CTA
- **About Page** — intro, work paragraphs, focus areas, process steps, locations
- **Contact Page** — heading, lead, studio details heading, note
- **Projects Page** — hero headline + subhead, category sections (Residential / Hospitality / Commercial)

Each page also has an optional **Meta Description** field — fills in the SEO description shown in search results.

---

## 12. How SEO descriptions fall back

For any page or project, the meta description in search results is chosen in order:

**Project page:**
1. Project's own **Meta Description** (if set)
2. Project's **Subtitle**
3. Project's **Summary**
4. Site-wide **Default Meta Description**

**Service page:**
1. Service's **Meta Description**
2. Service's **Summary**
3. Service's **Intro**
4. Site-wide **Default Meta Description**

**Top-level pages (Home / About / Contact / Projects):**
1. Page's own **Meta Description**
2. Site-wide **Default Meta Description**

You don't need to fill in every Meta Description — set the site-wide default once and it covers anything left blank.

---

## 13. Common gotchas

- **Don't change a slug after publishing.** It changes the URL and breaks any external links. If you must, ask a developer to add a redirect first.
- **Don't upload PNG photos.** Use WebP. PNGs are 20–30× larger and can make pages slow.
- **Don't leave Card Image blank** on a published project. The card on the homepage and listing will be a placeholder.
- **Don't manually edit `tags:` or `permalink:`** in the CMS — they're hidden fields the site needs.
- **Order numbers don't have to be sequential.** Use `1, 2, 3` or `10, 20, 30` — gaps make it easier to insert later.
- **Adding a project to the homepage requires editing two places** — the project entry AND the Homepage entry's Featured Projects list. The CMS does both, but they're separate steps.
- **A project shown in two homepage slots** uses the same card image on both, unless you set a Selected Project Image override on one slot.
- **The Decap CMS preview pane** is a content sketch. The actual public site may render slightly differently (fonts, hover states, animations).
- **Save often.** Decap saves drafts as you type, but a full Publish commits to the repository.

---

## 14. Workflow

### Live editing

1. Open `/admin/` on the live site
2. Edit through the CMS
3. Click **Publish**
4. Wait ~1–2 minutes for Netlify to rebuild
5. Refresh the public site

### Local preview before publishing

If a developer is running the site locally, they can show you the changes before going live:

```sh
npm install
npm start
```

Visit `http://localhost:8080/`. Combined with `npx decap-server` in another terminal, the CMS at `http://localhost:8080/admin/` works on local files.

---

## 15. Glossary of project fields

| Field | What it does |
|---|---|
| Title | Project name shown everywhere |
| Slug | URL identifier and image-folder name |
| Status | Published / Coming Soon / Draft |
| Order | Sort order on the Projects listing (lower = earlier) |
| Show in Projects Listing | Whether the card appears on /projects.html |
| Listing Card Width | How wide the card is on the Projects listing |
| Category | Residential / Hospitality / Commercial |
| Kicker | Small label above the title on cards |
| Card Image / Alt | Image used on cards everywhere this project is referenced |
| Hero Image / Alt | Large image at the top of the project page |
| Subtitle | Short description below the title |
| Status Label | Text for the "Coming soon" badge (only shown when Status is Coming Soon) |
| Project Tags | Chip tags shown in the hero overlay |
| Article Heading | Heading above the lead text. Defaults to "Overview" |
| Summary | Short fallback used by Coming Soon pages and SEO |
| Lead | Opening paragraph on the project page |
| Body | Long-form case study (Published only) |
| Callout | Highlighted box with title + text |
| Extra Sections | Additional headed sections (Published only) |
| Facts | Key/value list in the sidebar |
| Aside Text | Small note above the Enquire button |
| Gallery | Image carousel on Published pages |
| CTA Heading + Text | Bottom band of the project page |
| Meta Title / Meta Description | SEO overrides |

---

## 16. Help

If something looks wrong on the public site after a save, or the CMS shows an error:

1. Don't panic — content is versioned in git, nothing is lost
2. Check the **Status** isn't accidentally set to Draft
3. Check the **Card Image** has a valid file path
4. If still stuck, ask a developer to look at the build log on Netlify
