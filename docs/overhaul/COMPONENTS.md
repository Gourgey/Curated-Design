# Component inventory

Last updated: 15 July 2026
Build-plan ticket: P2.3 — Define reusable interface components

This is a working audit of the interface patterns the site already has, ahead of consolidating them into a documented, shared component set. It records what exists today, where it's duplicated across templates, and what's genuinely blocked on content or business decisions rather than available to build now. It is deliberately an audit, not a rewrite — see "What this ticket did not do" below for why.

## Components that already exist as shared partials

| Component | Location | Notes |
| --- | --- | --- |
| Site header + overlay menu | `src/_includes/partials/nav.njk`, `assets/js/navigation.js` | Accessible focus-trapped overlay menu, implemented in Phase 1; compact pill-menu variant for the in-page quick-filter nav. |
| Hero brand mark | `src/_includes/partials/hero-brand.njk` | Used by most non-homepage templates. |
| CTA band | `src/_includes/partials/cta-band.njk` | Parameterised (`ctaId`, `ctaClass`, `text`, `href`); currently only used on the Studio page — the plan's shared "call-to-action band" component target. |

## Components that exist, but duplicated per template (candidates for consolidation)

These render consistent-looking results today, but each template reimplements its own markup/class names rather than sharing one partial. Consolidating them is real work — it touches CSS selectors across every page that uses them — so it should happen as part of the P2.2 stylesheet reorganisation (or immediately after), with the same visual-diff discipline, not as a drive-by rename.

| Component | Current implementations | Duplication found |
| --- | --- | --- |
| Breadcrumb / back navigation | `.project-backlink` (`src/projects/project-pages.njk`), `.app-backlink` (`src/apps/app-pages.njk`, `src/apps/legal-pages.njk`), `.legal-backlink` (`src/legal-pages.njk`) | Four separate class names and two different markup shapes (bare `<a>` vs. `<a>` wrapped in `<p>`) for the same "back to X" pattern. Service pages have no back-navigation at all — there is no Services index yet (P3.2), so there is nowhere to point it. |
| Card (project / service) | `.projects-card` (`src/projects.njk`), `.home-service-card` (`src/index.njk`) | Same media/title/summary shape, independently named. The plan's "completed project card" and "service card" targets should share a base card pattern with a modifier, not two parallel implementations. |
| Project status card (concept/in-progress) | Rendered inline inside `src/projects/project-pages.njk` and the `.projects-card` variants in `src/projects.njk` via `isComingSoon` | Status (`coming_soon`, `published`) is already real HTML text (e.g. the "Coming soon" pill rendered in markup, confirmed in a live preview during this pass) rather than baked into artwork — this specific plan requirement is already met. It is not yet a named, documented, reusable "concept card" component distinct from the completed-project card. |

## Components that are genuinely blocked, not just undocumented

| Component | Why it's blocked |
| --- | --- |
| Global footer | No `<footer>` element exists anywhere in the codebase today — confirmed by search. Building one now would mean inventing footer content (which legal links, which social links, exact copy) ahead of the open decision recorded in `docs/overhaul/DECISIONS.md` ("Secondary/footer destinations... Open... Needed before: Global footer build"). This is P3.1's job once that decision is made. |
| Quote/testimonial block | No genuine testimonial content exists in the repository. The only `<blockquote>` in the codebase is `.project-callout__text` in `src/projects/project-pages.njk`, an editorial design callout, not a client quote. Per the decision log, testimonials must not be invented. |
| Process/deliverable list | No approved service process copy exists yet to build a real one against; each service page currently has an ad hoc `glance` section (`service.data.glance`) that partially covers this need already. |

## Update (July 2026): the CSS blocker is cleared

The original version of this document held off on consolidating the backlink/card duplication because `assets/css/styles.css` had ~27 `no-duplicate-selectors` findings that turned out to be deliberate later-source-order overrides, not dead code — reconciling them required real design-reconciliation work, not a mechanical delete. That reconciliation is now done (see P2.2's implementation note in `SITE-OVERHAUL-BUILD-PLAN.md`): all 27 were merged into single rules, verified with pixel-level before/after diffing, with zero visual change.

**What this means for this ticket:** extracting `.project-backlink`/`.app-backlink`/`.legal-backlink` into one shared partial, and `.projects-card`/`.home-service-card` into one shared card pattern, is no longer blocked by unresolved CSS duplication. It's still not done — it wasn't attempted in this pass — but the previously-cited reason it was deferred no longer applies. It remains real work: the three backlink implementations render with genuinely different visual treatments (the project one is an elaborate italic-serif treatment on a dark hero overlay; app/legal are plain text links), so unifying the *markup* into one partial means designing a modifier system (one base class, page-specific modifier classes), not just renaming. That's a design decision worth making deliberately rather than as a side effect of a refactor — recommend scoping it as its own ticket, verified the same way (pixel-diff before/after on every affected template, not just the one being changed).

## What this pass did not do

Extracting the duplicated components into shared partials was not attempted, now that the reason for deferring it (CSS duplication) is resolved. This remains recommended future work, in this order:

1. Design one shared backlink/breadcrumb partial with modifier classes for the three existing visual treatments (project/app/legal), verify against all affected templates.
2. Design one shared card partial (base + completed/concept modifiers) covering `.projects-card` and `.home-service-card`.
3. Build the global footer and quote/testimonial block only once their content-side blockers (open footer decision, genuine testimonial content) are resolved — not before.
