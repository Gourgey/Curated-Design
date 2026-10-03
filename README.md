# Curated Design Website

This site is a static Netlify site generated with Eleventy. Content is edited directly in the repository's JSON and Markdown files. The visual design lives in the existing CSS and JavaScript files; content lives in `src/content`.

`assets/css/styles.css` is a **generated file** — edit the source partials in `assets/css-partials/` instead (numbered `01-`–`11-`, concatenated in filename order). It rebuilds automatically as part of `npm run build`, `npm start`, and `npm run check`; run `npm run build:css` directly if you just want to regenerate it without a full build. See `docs/overhaul/DESIGN-TOKENS.md` for how the partials are organised.

> **Editing content?** See [CONTENT-GUIDE.md](CONTENT-GUIDE.md) for where every piece of content lives and how to change it.

## Local Development

Use Node.js 22.12 or newer. If you use `nvm`, run `nvm use` to select the repository's Node 22 runtime.

Install dependencies once:

```sh
npm install
```

Build the static site:

```sh
npm run build
```

Run the build plus content, JavaScript, link, asset, metadata, indexing, and representative accessibility checks:

```sh
npm run check
```

Regenerate the overhaul's visual reference screenshots:

```sh
npm run capture:references
```

Run a local development server:

```sh
npm start
```

Format and lint checks are available as separate commands and are not yet part of `npm run check`:

```sh
npm run format        # rewrite files with Prettier
npm run format:check  # verify formatting without writing
npm run lint:js       # ESLint over repository JavaScript
npm run lint:css      # Stylelint over assets/css-partials/ (the CSS source of truth)
```

`lint:css` targets `assets/css-partials/` rather than the generated `assets/css/styles.css`. `format:check` reports pre-existing formatting differences across the wider repository (docs, `tools/`); Prettier has not been run repository-wide, so treat that as a baseline rather than a bug list.

## Editing Projects

Projects are stored as Markdown files in:

```text
src/content/projects/
```

Each project controls its title, slug, category, listing image, hero image, tags, facts, article copy, optional gallery, and CTA copy. To add one, duplicate an existing project file, change the `slug`, update the content, and rebuild.

Project URLs are generated from the slug:

```text
/work/project_slug/
```

Set `showInProjects: true` to include a project on `/work/`. Homepage project cards are curated in `src/content/pages/home.json`, which references projects by slug and uses each Project's card image, title, kicker, and URL.

## Editing Services

Services are stored as Markdown files in:

```text
src/content/services/
```

Each service controls its reusable card image, card alt text, detail page cover image, intro, at-a-glance rows, content sections, enquiry copy, and CTA. To feature a service on the homepage, add its slug to `servicesSection.featuredServices` in `src/content/pages/home.json`. To add one, duplicate an existing service file, change the `slug`, update the `order`, and rebuild.

Service URLs are generated from the slug:

```text
/services/service_slug/
```

## Editing Pages and Settings Manually

Global studio details live in:

```text
src/content/settings.json
```

Editable page content lives in:

```text
src/content/pages/
```

Use these files for homepage, about page, contact page, and project listing text. The contact form fields, CSS, animations, navigation behavior, and page templates remain code-owned for stability.

## Netlify Setup

Netlify should use:

```text
Build command: npm run build
Publish directory: _site
```

These values are also committed in `netlify.toml`. The contact form remains a Netlify form and is rendered into the generated `/contact/` page.

## Site Overhaul

The implementation programme is in [SITE-OVERHAUL-BUILD-PLAN.md](SITE-OVERHAUL-BUILD-PLAN.md). Phase 0 working records are kept in:

- [Content inventory](docs/overhaul/CONTENT-INVENTORY.md)
- [Decision log](docs/overhaul/DECISIONS.md)
- [Audit and check baseline](docs/overhaul/BASELINE.md)
- [Shared design tokens](docs/overhaul/DESIGN-TOKENS.md)
- [Component inventory](docs/overhaul/COMPONENTS.md)
