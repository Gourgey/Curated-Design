# Curated Design Website

This site is a static Netlify site generated with Eleventy and edited through Decap CMS. The visual design lives in the existing CSS and JavaScript files; content lives in `src/content`.

> **Editing content?** See [CONTENT-GUIDE.md](CONTENT-GUIDE.md) for a non-developer walkthrough of adding projects, services, and homepage sections through the CMS.

## Local Development

Install dependencies once:

```sh
npm install
```

Build the static site:

```sh
npm run build
```

Run a local development server:

```sh
npm start
```

## CMS Access

The Decap CMS admin area is available at:

```text
/admin/
```

The CMS uses the GitHub backend for `Gourgey/Curated-Design` on the `main` branch. Anyone editing through the CMS needs GitHub access to this repository. On Netlify, keep the build command as `npm run build` and the publish directory as `_site`.

### Editing the CMS locally

`admin/config.yml` has `local_backend: true`, so you can run Decap against the local file system instead of GitHub. This is the safest way to test schema changes or content edits before they hit `main`.

In one terminal, start the dev server:

```sh
npm start
```

In a second terminal, start the Decap proxy:

```sh
npm run cms:local
```

Then open `http://localhost:8080/admin/`. Saves write directly to local files under `src/content/`. Commit manually after testing.

## Editing Projects

Projects are stored as Markdown files in:

```text
src/content/projects/
```

Each project controls its title, slug, category, listing image, hero image, tags, facts, article copy, optional gallery, and CTA copy. To add a project in the CMS, use the `Projects` collection. To add one manually, duplicate an existing project file, change the `slug`, update the content, and rebuild.

Project URLs are generated from the slug:

```text
/projects/project_slug.html
```

Set `showInProjects: true` to include a project on `projects.html`. Homepage project cards are curated from the Homepage entry in Decap, which references Project entries by slug and uses each Project's card image, title, kicker, and URL.

## Editing Services

Services are stored as Markdown files in:

```text
src/content/services/
```

Each service controls its reusable card image, card alt text, detail page cover image, intro, at-a-glance rows, content sections, enquiry copy, and CTA. To feature a service on the homepage, add it to the Homepage entry's featured services list in Decap. To add a service in the CMS, use the `Services` collection. To add one manually, duplicate an existing service file, change the `slug`, update the `order`, and rebuild.

Service URLs are generated from the slug:

```text
/curated_services/service_slug.html
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

These values are also committed in `netlify.toml`. The contact form remains a Netlify form and is rendered into the generated `contact.html`.
