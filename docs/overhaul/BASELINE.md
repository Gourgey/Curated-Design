# Overhaul baseline

Baseline preserved: 15 July 2026

The audit figures below are preserved before the broader visual rebuild. Repeat performance comparisons under an equivalent production-like profile and use the median of three runs.

## Preserved audit baseline

| Measure | Baseline |
| --- | ---: |
| Production build | Pass |
| Generated HTML pages | 29 |
| Rendered images | 80 |
| Forms | 7 |
| Internal links checked by the original audit | 264 |
| Missing local assets | 0 |
| Broken internal links | 0 |
| Duplicate IDs | 0 |
| Mobile sitemap URLs checked at 390px | 27 |
| Failed images, runtime errors, or page-level overflow | 0 |
| Lighthouse performance | 61 |
| Lighthouse accessibility | 84 |
| Lighthouse best practices | 100 |
| Lighthouse SEO | 100 |
| First Contentful Paint | 3.2s |
| Largest Contentful Paint | 4.2s |
| Total Blocking Time | 400ms |
| Cumulative Layout Shift | 0 |
| Approximate initial transfer | 474 KiB |
| Known dependency vulnerabilities at audit time | 0 |

The original Lighthouse run reported slow host CPU. A single later run is not a valid comparison.

## First-milestone reproducible check

Run:

```sh
npm run check
```

The command now performs:

1. project, service, settings, relationship, local-image, and CMS-field contract validation;
2. JavaScript syntax checks across repository-owned scripts;
3. a clean production Eleventy build and CSS minification;
4. generated HTML structure, metadata, duplicate-ID, internal-link, local-asset, fragment, `srcset`, sitemap, draft, and indexing checks.
5. Axe accessibility scans of representative mobile templates, the open mobile menu, and the desktop homepage, plus a mobile-menu focus trap/Escape/restoration smoke test; critical and serious violations fail the command.

First passing result after the initial corrections:

| Measure | Result |
| --- | ---: |
| Project records validated | 7 |
| Service records validated | 6 |
| Repository JavaScript files syntax-checked | 14 |
| Representative Axe scans | 8 |
| Generated HTML pages | 29 |
| Rendered images | 79 |
| Forms | 7 |
| Internal link references checked by the new checker | 236 |

The image count reduced from 80 to 79 because the Marylebone Lobby hero was removed from its gallery duplicate position. The two internal-link figures use different counting rules and should not be compared as a performance regression; 236 is the stable count emitted by the new repository check.

## Environment

- Local verification: Node 25.8.1.
- Supported repository runtime: Node 22.12 or newer, with Node 22 selected by `.nvmrc` and CI.
- Eleventy: 3.1.6 from the lockfile used during local verification.

The first milestone pinned the runtime early because the accessibility tooling requires Node 22.12 or newer.
