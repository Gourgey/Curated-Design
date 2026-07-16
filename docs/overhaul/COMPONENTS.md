# Component inventory

Last updated: 15 July 2026
Build-plan ticket: P2.3 — Define reusable interface components

This is a working audit of the interface patterns the site already has, ahead of consolidating them into a documented, shared component set. It records what exists today, where it's duplicated across templates, and what's genuinely blocked on content or business decisions rather than available to build now. It is deliberately an audit, not a rewrite — see "What this ticket did not do" below for why.

## Components that already exist as shared partials

| Component | Location | Notes |
| --- | --- | --- |
| Site header + overlay menu | `src/_includes/partials/nav.njk`, `assets/js/navigation.js` | Accessible focus-trapped overlay menu, implemented in Phase 1; compact pill-menu variant for the in-page quick-filter nav. |
| Hero brand mark | `src/_includes/partials/hero-brand.njk` | Used by most non-homepage templates. |
| CTA band | `src/_includes/partials/cta-band.njk` | Parameterised (`ctaId`, `ctaClass`, `text`, `href`); used on the homepage, projects listing, service pages, and project-detail pages — the plan's shared "call-to-action band" component target. Its CSS lives in `assets/css-partials/13-buttons-cta.css` (P2.2). |
| Breadcrumb / back navigation | `src/apps/app-pages.njk`, `src/apps/legal-pages.njk`, `src/legal-pages.njk`, `src/projects/project-pages.njk` | Consolidated (P2.2 follow-up, July 2026) into `.backlink`/`.backlink--pill` (apps + studio legal, byte-for-byte identical before the merge) and `.backlink--hero` (project detail, over the dark hero image) in `assets/css-partials/15-backlink.css`. Each template's existing DOM shape (bare `<a>` for the project page; `<a>` wrapped in a `.backlink-row` `<p>` for apps/legal) was kept as-is — only the class names/CSS were unified, not the markup shape. Service pages still have no back-navigation; unchanged, see below. |
| Card (project / service) | `src/projects.njk`, `src/index.njk` | Consolidated (P2.2 follow-up, July 2026) into `.card`/`.card--project`/`.card--service` in `assets/css-partials/16-card.css`. The wrapper/media/hover shape and title styling (parameterised 22px vs. 24px via `--card-title-size`) were genuinely identical; the sub-text was not — a project card's `.card__kicker` is a taxonomy label, a service card's `.card__summary` is a description sentence, so those stayed as separate classes rather than being forced into one "summary" field. |

## Components that exist, but duplicated per template (candidates for consolidation)

These render consistent-looking results today, but each template reimplements its own markup/class names rather than sharing one partial. Consolidating them is real work — it touches CSS selectors across every page that uses them — so it should happen as part of the P2.2 stylesheet reorganisation (or immediately after), with the same visual-diff discipline, not as a drive-by rename.

| Component | Current implementations | Duplication found |
| --- | --- | --- |
| Project status card (concept/in-progress) | Rendered inline inside `src/projects/project-pages.njk` and the `.card--project` variants in `src/projects.njk` via `isComingSoon` | Status (`coming_soon`, `published`) is already real HTML text (e.g. the "Coming soon" pill rendered in markup, confirmed in a live preview during this pass) rather than baked into artwork — this specific plan requirement is already met. It is not yet a named, documented, reusable "concept card" component distinct from the completed-project card — no concept-status project currently exists in the published content to design one against (see the hard content gate in `SITE-OVERHAUL-BUILD-PLAN.md` §1). |

## Components that are genuinely blocked, not just undocumented

| Component | Why it's blocked |
| --- | --- |
| Global footer | No `<footer>` element exists anywhere in the codebase today — confirmed by search. Building one now would mean inventing footer content (which legal links, which social links, exact copy) ahead of the open decision recorded in `docs/overhaul/DECISIONS.md` ("Secondary/footer destinations... Open... Needed before: Global footer build"). This is P3.1's job once that decision is made. |
| Quote/testimonial block | No genuine testimonial content exists in the repository. The only `<blockquote>` in the codebase is `.project-callout__text` in `src/projects/project-pages.njk`, an editorial design callout, not a client quote. Per the decision log, testimonials must not be invented. |
| Process/deliverable list | No approved service process copy exists yet to build a real one against; each service page currently has an ad hoc `glance` section (`service.data.glance`) that partially covers this need already. |

## Update (July 2026): the CSS blocker is cleared

The original version of this document held off on consolidating the backlink/card duplication because `assets/css/styles.css` had ~27 `no-duplicate-selectors` findings that turned out to be deliberate later-source-order overrides, not dead code — reconciling them required real design-reconciliation work, not a mechanical delete. That reconciliation is now done (see P2.2's implementation note in `SITE-OVERHAUL-BUILD-PLAN.md`): all 27 were merged into single rules, verified with pixel-level before/after diffing, with zero visual change.

**What this means for this ticket:** extracting `.project-backlink`/`.app-backlink`/`.legal-backlink` into one shared partial, and `.projects-card`/`.home-service-card` into one shared card pattern, is no longer blocked by unresolved CSS duplication. It's still not done — it wasn't attempted in this pass — but the previously-cited reason it was deferred no longer applies. It remains real work: the three backlink implementations render with genuinely different visual treatments (the project one is an elaborate italic-serif treatment on a dark hero overlay; app/legal are plain text links), so unifying the *markup* into one partial means designing a modifier system (one base class, page-specific modifier classes), not just renaming. That's a design decision worth making deliberately rather than as a side effect of a refactor — recommend scoping it as its own ticket, verified the same way (pixel-diff before/after on every affected template, not just the one being changed).

## Update (July 2026, round 2): backlink and card consolidated

Steps 1 and 2 of the recommended order below are now done — see the "shared partials" table above for what each ended up looking like. Both were verified the same way: `npm run check` (build, output structure, and the accessibility gate's interaction smoke tests) plus reading back computed styles on every affected live page against the pre-refactor values, not just a visual glance.

One outcome worth flagging: the "same media/title/summary shape" description in the original audit undersold a real difference — a project card's second line is a taxonomy label, a service card's is a description sentence. The consolidated component keeps `.card__kicker` and `.card__summary` as distinct classes for that reason, rather than merging them into one generic "summary" slot the way the original audit implied it should.

## What this pass did not do

Building the global footer and quote/testimonial block remains blocked on their content-side decisions (open footer-links decision, genuine testimonial content) — not attempted, and shouldn't be until those are resolved. See "Components that are genuinely blocked" above.
