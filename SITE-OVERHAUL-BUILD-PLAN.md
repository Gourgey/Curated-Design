# Curated Design Website — Overhaul Build Plan

## 1. Purpose

This plan turns the full site audit into an ordered implementation programme. It preserves the strongest parts of the current site—the editorial art direction, restrained palette, typography, image-led presentation, and static Eleventy architecture—while correcting the content, UX, accessibility, performance, CMS, and maintainability issues identified in the audit.

The work is intentionally ordered so that correctness and content decisions come before a visual rebuild. The new interface should not be used to disguise incomplete portfolio material or unresolved content structure.

### Companion documents

The plan is tracked against these repository documents, which hold the evidence behind each gate. When a ticket changes a decision, a baseline, or the schema, update the relevant companion document in the same change set; the plan itself should stay stable while those documents absorb day-to-day detail.

- `docs/overhaul/BASELINE.md` — preserved audit baseline and the first-milestone `npm run check` results (P0.6).
- `docs/overhaul/CONTENT-INVENTORY.md` — Phase 0 project classification, findings, and the per-project approval checklist (P0.1).
- `docs/overhaul/DECISIONS.md` — confirmed positions, open business decisions, and unassigned owners (P0.2–P0.5). Check it before starting any ticket that depends on an open decision.
- `docs/overhaul/DESIGN-TOKENS.md` — the implemented token layer and migration rules (P2.1).
- `CONTENT-GUIDE.md` — editor-facing instructions for the content model.
- `README.md` — runtime, install, and command documentation (P2.7).

### Status at last update — 15 July 2026

- **Phase 0** is documentarily complete, but several decisions remain open with unassigned owners: final navigation structure, analytics, the case-study launch threshold, image permissions, and legal review. `docs/overhaul/DECISIONS.md` is the authoritative list.
- **Phase 1** has largely landed: the `npm run check` gate, visual references, navigation accessibility and focus management, contrast and target-size corrections, carousel deduplication (rendered image count 80 → 79), standardised form feedback, and indexing controls for coming-soon teasers. Walk the Phase 1 exit-gate checklist before declaring the phase closed — the CMS save-and-build round trip (P1.8) and staged form submission (P1.9) in particular need explicit verification on a deploy preview.
- **Phase 2** is in progress: P2.1 tokens and P2.7 runtime pinning are done; P2.2 stylesheet reorganisation is the active front.
- **Hard content constraint:** only Marylebone Lobby is published; the two-to-three case-study target in §2 is not met. Engineering can proceed through Phase 2, but the Phase 3–4 homepage and Work redesign is blocked on content per the hard gate in §14.

## 2. Target outcome

At completion, the website should:

- communicate the studio's offer and location immediately;
- lead visitors clearly from discovery to relevant work, services, and enquiry;
- present completed work before concepts or work in progress;
- provide at least two or three credible, complete case studies;
- meet WCAG 2.2 AA for the audited templates and interactions;
- achieve a repeatable mobile Lighthouse performance score of at least 85, measured as the median of three production-like runs;
- have one dependable content model shared by templates and the chosen CMS workflow;
- include automated checks for builds, links, assets, content schemas, accessibility, and core interactions;
- remain a lightweight static site rather than becoming a framework-heavy application;
- be straightforward for a future developer or content editor to maintain.

## 3. Guiding decisions

These principles apply throughout the build:

1. **Keep Eleventy.** There is no architectural reason to rewrite the site in React or another client-side framework.
2. **Preserve the visual identity.** The overhaul should refine and systematise the established editorial direction, not replace it with a generic agency template.
3. **Content leads design.** Final page layouts should be built around real project material and real studio claims.
4. **Completed work leads the portfolio.** Concepts and in-progress projects may remain visible, but they must be clearly separated and labelled.
5. **Progressive enhancement is the baseline.** Navigation, links, forms, and essential content must remain usable if JavaScript fails.
6. **Accessibility is a release requirement.** It is not a final polish pass.
7. **One source of truth for content.** Public templates, Decap CMS, and any retained visual editor must share a documented schema.
8. **Measure before and after.** Preserve the audit baselines and compare changes using repeatable tests.

## 4. Scope boundaries

### In scope

- information architecture and navigation;
- homepage, Work, project, Services, service, Studio, Contact, legal, support, thank-you, and error templates;
- responsive UI and interaction design;
- accessibility remediation;
- content model and CMS workflow;
- CSS and JavaScript foundations;
- responsive image and font delivery;
- technical SEO and structured data;
- form behaviour and validation;
- security and privacy headers;
- automated test and release workflow;
- migration and redirect planning if clean URLs are approved.

### Not automatically in scope

The following require an explicit business or content decision before implementation:

- inventing project facts, outcomes, awards, client quotes, or testimonials;
- publishing photography without confirmed rights;
- claiming accreditations, locations, experience, or services that cannot be substantiated;
- legal approval of privacy, terms, or app-support content;
- adding analytics, advertising pixels, cookie tooling, chat widgets, or spam services;
- changing the studio name, logo, or core brand identity;
- rewriting the site in a different application framework.

## 5. Delivery overview

The estimates below are directional development estimates for one developer. Content production, stakeholder review, and photography can extend the calendar independently.

| Phase | Focus | Estimated effort | Dependency | Exit gate |
| --- | --- | ---: | --- | --- |
| 0 | Decisions, content inventory, and baseline | 1–2 days plus content review | None | Required decisions recorded and project content classified |
| 1 | Safety net and critical correctness | 3–5 days | Phase 0 decisions that affect public status | Critical accessibility and content-contract faults fixed |
| 2 | Shared foundations and design system | 4–7 days | Phase 1 snapshots and tests | Reusable tokens/components support the planned pages |
| 3 | Information architecture and content migration | 4–8 days plus content | Sufficient approved content | New structure works end to end with real content |
| 4 | Page-by-page UI and UX overhaul | 5–10 days | Phases 2–3 | All core templates approved at target breakpoints |
| 5 | Performance, SEO, security, and CMS hardening | 3–6 days | Stable templates | Quality budgets and platform checks pass |
| 6 | UAT, launch, and measurement | 2–4 days | All prior gates | Production launch checklist completed |

Expected development range: approximately **19–42 working days**, with the largest uncertainty being the availability and approval of credible project content.

### Repository map

Where the work described in this plan actually lives:

| Area | Location | Notes |
| --- | --- | --- |
| Base layout and metadata | `src/_includes/layouts/base.njk` | The single layout contract targeted by P2.5 |
| Shared partials | `src/_includes/partials/` | Currently `nav.njk`, `hero-brand.njk`, `cta-band.njk`; the P2.3 component set grows here |
| Page templates | `src/*.njk`, `src/projects/`, `src/curated_services/` | Public templates consuming the content model |
| Content model | `src/content/` | `projects/`, `services/`, `pages/`, `settings.json` |
| Global data | `src/_data/site.js` | Site metadata and the stylesheet version parameter (see P2.6) |
| Decap CMS schema | `admin/config.yml` | Must stay in sync with templates per P1.8 |
| CSS source | `assets/css-partials/*.css` | Edit here, not `assets/css/styles.css` (generated by `tools/build-css.js`, then minified by `tools/minify-css.js` during the build) — see P2.2 and `docs/overhaul/DESIGN-TOKENS.md` |
| Client JavaScript | `assets/js/navigation.js`, `assets/js/carousels.js`, `assets/js/scroll-effects.js`, `assets/js/contact-form.js` | Split from the former `main.js` in P2.4 |
| Automated checks | `tools/check-*.js` | Content/schema contract, JavaScript syntax, output structure, accessibility |
| Visual references | `tests/visual/reference/` | P1.2 screenshots at 390/768/1440px, including nav-open and form error/success states |
| Custom visual CMS | `tools/visual-cms/` | Outside the supported publishing path per the decision log |
| Hosting configuration | `netlify.toml` | Build command, publish directory, cache headers |

### Key commands

- `npm run check` — the full quality gate: content/schema validation, JavaScript checks, production build, output checks, and representative Axe scans. Run before every commit that touches templates, content, CSS, or JavaScript.
- `npm run capture:references` — rebuilds and regenerates the visual reference screenshots. Run only when a visual change is intentional, and review the resulting image diff deliberately; refreshing references without review defeats their purpose.
- `npm start` — Eleventy dev server.
- `npm run build` — production build to `_site/`.
- `npm run cms` / `npm run cms:local` — custom visual CMS server / Decap local backend.

The screenshot and accessibility tooling uses `puppeteer-core`, which drives a locally installed Chrome or Chromium rather than downloading its own. Any CI environment running `npm run check` or `capture:references` must provide a system browser.

## 6. Phase 0 — Decisions, inventory, and baseline

### Objective

Remove the business and content ambiguities that would otherwise cause rework. Establish a reproducible baseline before modifying the site.

### P0.1 — Classify every project

Create a content inventory that records, for every project:

- public title and location;
- project type and service category;
- status: completed, in progress, concept, archived, or private;
- whether imagery is photography, visualisation, concept art, or a mixture;
- image ownership and publication permission;
- available project facts, design brief, constraints, interventions, and results;
- whether the project is strong enough to be a complete public case study;
- whether it should be indexed, linked, held as a draft, or removed.

**Decision rule:** incomplete pages must not be presented with the same visual weight as completed work.

**Acceptance criteria**

- Every existing project has one unambiguous status.
- At least two or three projects are identified for full case-study treatment, or the launch plan explicitly acknowledges that this is not yet possible.
- Every public image has a known type and publication status.
- Archived and private content cannot enter the production collection accidentally.

**Implementation note (July 2026):** the working inventory exists at `docs/overhaul/CONTENT-INVENTORY.md` — seven records: one published (Marylebone Lobby), five coming-soon teasers, one archived draft. Review Garden Restaurant early: its card and hero use different image sources and the hero filename refers to the older "Monet Terrace" asset set.

### P0.2 — Agree the content hierarchy

Approve the intended primary navigation:

- Work
- Services
- Studio
- Contact

Approve the secondary/footer destinations:

- contact details;
- core navigation;
- legal/company information;
- real social profiles only;
- app support and related documents, retained at stable URLs but removed from the Studio page's primary narrative.

### P0.3 — Choose the primary CMS workflow

Select one of these operating models:

1. **Decap as the primary structured CMS**, supported by deploy previews and an editorial workflow; or
2. **The custom visual CMS as the primary editor**, rebuilt to consume the same generated schema as the public templates.

The other editor may remain available only if it consumes the same schema and has a clear support purpose. Do not maintain two manually duplicated field definitions.

**Recommended default:** retain Decap as the primary structured editor unless the visual editor is essential to day-to-day publishing.

### P0.4 — Decide the URL strategy

Choose between:

- retaining current URLs to minimise migration risk; or
- moving to clean directory URLs such as `/work/`, `/studio/`, `/services/interior-design/`, and `/contact/`.

If clean URLs are approved, prepare a complete old-to-new redirect map before changing permalinks. App support and legal URLs used by external products must remain stable or have permanent redirects.

### P0.5 — Decide analytics and consent requirements

Confirm whether the business needs:

- privacy-preserving traffic measurement;
- enquiry conversion measurement;
- Core Web Vitals reporting;
- no analytics at all.

Do not add analytics or cookie tooling by default. Any selected service must be reflected in the privacy notice and security policy.

### P0.6 — Preserve the audit baseline

Record the existing audit results in the project documentation or CI artefacts:

- production build passes;
- 29 HTML pages, 80 rendered images, 7 forms, and 264 internal links;
- no broken internal links, missing assets, duplicate IDs, or missing public title, description, H1, or main landmark;
- 27 sitemap URLs checked at a true 390px viewport with no failed images, runtime errors, or page-level horizontal overflow;
- Lighthouse mobile baseline: performance 61, accessibility 84, best practices 100, SEO 100;
- FCP 3.2s, LCP 4.2s, TBT 400ms, CLS 0;
- approximately 474 KiB initial transfer;
- current dependency audit has no known vulnerabilities.

Because the Lighthouse run reported slow host CPU, future comparisons must use the median of three equivalent runs rather than a single score.

### Phase 0 exit gate

- [ ] Project inventory approved.
- [ ] Public/draft/indexing status assigned to all content.
- [ ] Primary CMS chosen.
- [ ] URL strategy chosen.
- [ ] Analytics decision recorded.
- [ ] Required photography, copy, permissions, and legal reviews have named owners.
- [ ] Baseline results stored.

## 7. Phase 1 — Safety net and critical correctness

### Objective

Fix issues that currently affect access, trust, or content integrity, and create enough automated protection to refactor safely.

### P1.1 — Add the initial automated check command

Create an `npm run check` workflow that can grow during the project. Its first version should run:

- the production Eleventy build;
- content/schema validation;
- internal-link and local-asset checks;
- HTML validation where practical;
- JavaScript and CSS linting/format checks;
- an automated accessibility scan for representative pages.

Run the same command in CI for every pull request or proposed merge.

### P1.2 — Capture visual-regression references

Before restructuring CSS, capture reference screenshots for:

- homepage;
- Work index;
- Studio;
- Contact;
- published project page;
- one service page;
- navigation open and closed;
- form error and success states.

Capture at minimum 390px, 768px, and 1440px widths. These references protect intentional visual qualities while obsolete CSS is removed.

**Implementation note (July 2026):** references are captured in `tests/visual/reference/` via `npm run capture:references`. Treat regeneration as a reviewed act, not a routine step — the comparison against the previous references is the actual safety mechanism.

### P1.3 — Repair the navigation interaction

Implement a fully accessible menu:

- give the menu button an accessible name;
- update that name and `aria-expanded` state when opened or closed;
- close on Escape and outside click where appropriate;
- move focus into the menu on open;
- trap focus while the full-screen overlay is active;
- restore focus to the trigger on close;
- prevent background scrolling;
- make background content inert or otherwise unavailable to assistive technology while open;
- expose the current page with `aria-current="page"`;
- keep all primary destinations usable without JavaScript.

**Acceptance criteria**

- The complete menu can be opened, traversed, and closed using only a keyboard.
- Screen readers announce the control, expanded state, and current page correctly.
- Focus never becomes lost behind the overlay.
- No layout shift or background scroll occurs when the menu opens.

### P1.4 — Correct landmarks, skip navigation, and focus styles

- Put the logo and primary navigation inside a real header landmark.
- Point the skip link at the actual `<main>` element, using a consistent layout/template convention.
- Keep floating or fixed calls to action inside an appropriate main or footer landmark.
- Provide clearly visible focus indicators for every link, button, form field, carousel control, and custom control.

### P1.5 — Fix colour contrast and small interactive targets

- Replace the failing muted-text colour token; the current `#807b72` on `#f2eee6` is approximately 3.63:1.
- Increase very small project and service labels from approximately 8px to a practical readable size, normally at least 11–12px depending on weight and contrast.
- Ensure normal text reaches WCAG AA 4.5:1.
- Give carousel dots and other compact controls a minimum 44-by-44px interactive area without making their visual mark unnecessarily large.

### P1.6 — Correct reduced-motion behaviour

When `prefers-reduced-motion: reduce` is active:

- disable smooth scrolling;
- remove parallax movement;
- remove or simplify carousel transitions;
- suppress decorative entrance animations;
- avoid automatic motion that cannot be paused.

### P1.7 — Repair carousel semantics and duplication

- Remove the duplicate Marylebone image caused by rendering the hero again as the first gallery item.
- Prefer a single carousel media model, or explicitly deduplicate gallery items against the hero.
- Mark the carousel and slides with appropriate group/region semantics.
- Expose the active state with `aria-current`.
- Ensure hidden slides do not expose misleading interactive or descriptive content.
- Add keyboard arrow support where it improves the control.
- Retain touch/swipe parity on project media.
- Add `type="button"` to non-submit buttons.
- Make each homepage featured slide a meaningful project link with visible title, category/status, and destination—or replace the carousel with one strong featured case study.
- Remove any `aria-label` that overrides visible service-card text and causes a label/content mismatch.

**Implementation note (July 2026):** the duplicate Marylebone hero/gallery image has been removed (rendered image count 80 → 79, recorded in `docs/overhaul/BASELINE.md`).

### P1.8 — Repair the content model/template contract

Resolve every known mismatch:

- render or remove the currently calculated project `headingText` value;
- render or deliberately remove the CMS-editable `gallery.heading` and `gallery.text` fields;
- update the custom visual CMS selectors if those fields remain;
- connect `primaryCtaUrl` to a real public CTA, or remove it from settings;
- add `shareImage` to the settings schema so a CMS save cannot discard it;
- define and implement the public behaviour of service `comingSoon` status;
- remove the duplicated `collapsed: false` entry from the Decap configuration;
- validate every editable field through a CMS save-and-build round trip.

Add a schema-to-template contract check so CMS fields cannot silently become unused or disappear from edited data.

### P1.9 — Repair form behaviour

- Use a dedicated `/thank-you/` success destination rather than posting/falling back to `/contact.html`.
- Standardise success and error behaviour across contact and service forms.
- Move keyboard focus to the success or error summary after an asynchronous response.
- Preserve native validation and a usable non-JavaScript form submission path.
- Add concise privacy microcopy and a privacy link near the submit action.
- Confirm which fields are genuinely required, including project type.
- Reconcile inconsistent budget ranges such as £80–150k on the general contact form and £5–15k on service forms.
- Keep the Netlify honeypot.
- Add Turnstile only if actual spam levels justify the extra privacy and UX cost.

Do not send a real production enquiry during automated testing. Test forms on an isolated deploy preview or staging context.

### P1.10 — Apply immediate indexing controls

- Keep admin and thank-you pages `noindex`.
- Remove incomplete/thin projects from the sitemap and set them to `noindex`, or hold them as drafts.
- Prevent archived projects from entering collections or feeds.
- Confirm that public app support/legal pages remain reachable where external products depend on them.

### Phase 1 exit gate

- [ ] Production build and initial `npm run check` pass.
- [ ] No critical or serious Axe violations on representative templates.
- [ ] Navigation passes keyboard and screen-reader smoke tests.
- [ ] All known CMS/template field mismatches are resolved.
- [ ] Duplicate carousel media is removed.
- [ ] Form fallback, asynchronous result, and focus behaviour are verified.
- [ ] Draft, archived, incomplete, and indexable statuses behave consistently.

## 8. Phase 2 — Shared foundations and design system

### Objective

Create the reusable implementation foundations for the redesigned pages without losing the current site's strongest visual characteristics.

### P2.1 — Establish design tokens

Consolidate repeated custom properties such as `--sp`, `--cp`, `--hp`, `--pp`, and `--srv` into a documented token layer covering:

- background, foreground, muted, border, accent, and state colours;
- type families, sizes, line heights, tracking, and weights;
- fluid spacing scale;
- content and full-bleed widths;
- grid gaps and page gutters;
- radii, borders, and shadows where used;
- layer/z-index values;
- motion duration and easing;
- responsive breakpoints.

Tokens should have semantic names rather than page-specific names.

**Implementation note (July 2026):** done — the token layer is documented in `docs/overhaul/DESIGN-TOKENS.md`. The legacy `--sp-*`/`--cp-*`/`--hp-*`/`--pp-*`/`--srv-*` variables survive only as compatibility aliases resolving to the shared tokens; P2.2 should retire them rather than let new work reference them.

### P2.2 — Reorganise CSS by responsibility

Split the 4,000-plus-line stylesheet source into maintainable layers or partials:

1. tokens;
2. reset and base typography;
3. layout primitives;
4. navigation and footer;
5. buttons, links, and forms;
6. cards and media;
7. carousels;
8. page modules;
9. accessibility and motion overrides;
10. utilities.

Continue compiling to one production stylesheet. Remove legacy selectors and redesign overrides only after visual comparison confirms they are no longer needed.

**Quality rules**

- Reduce dependence on `body.page` specificity.
- Avoid `!important` except for a documented accessibility or utility reason.
- Do not neutralise old rules by adding later source-order overrides.
- Prefer container/layout primitives to repeated page-specific measurements.

**Implementation notes (July 2026):**

- CSS custom properties cannot be interpolated into media-query conditions, so the `--breakpoint-*` tokens are documentation only; media queries must use the documented literal widths (640/760/920/1180/1280px).
- Legacy breakpoints at 700/820/900/901/980/1000/1001/1120px remain in the stylesheet. Part of this ticket is deciding, per breakpoint, whether it represents a real component need or collapses into the shared set.
- After each extraction step, run `npm run check` and compare against the visual references before removing the superseded rules — the plan's "remove only after visual comparison" rule is enforced by nothing except this discipline.

**Status (July 2026): duplicate-selector reconciliation, breakpoint consolidation, the physical (order-preserving) file split, legacy token-alias retirement, and a first true by-topic regrouping (carousels) are complete.**

`npm run lint:css` (Stylelint) originally surfaced ~27 `no-duplicate-selectors` findings. Investigation showed these were not accidental copy-paste duplicates — each was a deliberate later-source-order override from a past change (an editorial "hero polish" pass, the P1.5 44×44px touch-target fix, the P2.1 token migration), where the later block is what actually renders. All 27 were reconciled into single rules, one cluster at a time:

- `.dots`, `.pillmenu-toggle .burger-line` (unscoped), `body.projects-page`, `html.concept-page`/`body.concept-page` — small clusters, 1–2 properties each.
- The `body.project-page` "hero and CTA editorial polish" cluster — 16 selectors (topbar, backlink, hero, hero-media, hero-overlay, hero-inner, kicker, title, subtitle, tags, tag, hero-control, hero-dots, top-left-logo, plus the project-wide burger-line override) — merged property-by-property (later value wins per property; properties unique to either block preserved).
- `.project-article`, `.project-callout` (which had *three* layered definitions, not two), `.project-facts` (moved its surviving `z-index: 2` into the canonical rule), `.project-aside` (dropped a `gap` that had already gone inert under a since-changed `display: block`).

Every merge was verified with pixel-level diffing, not just a visual glance: `tools/capture-references.js` supports `--output=`/`--stylesheet-file=`/`--stylesheet-git-ref=` flags precisely for this (see `tests/visual/reference/README.md`), which made it possible to render the same generated HTML through both the pre- and post-edit stylesheet and diff the resulting screenshots pixel-by-pixel (via `sharp`, already a transitive dependency) rather than eyeballing them. The project page — the highest-risk template, carrying the 16-selector cluster — came back byte-identical at 390/768/1440px both before and after. Two pages showed small, non-zero diffs (home-390, work-390, a stray contact-error-390 page-height difference); each was confirmed via a control test (rebuilding with the *unedited* stylesheet and re-diffing) to be pre-existing capture non-determinism unrelated to any CSS content — reproduced with the exact same pixel count/region regardless of which stylesheet was rendered. This is worth knowing for any future CSS work in this repo: a single `capture:references` diff on `-390` variants is not by itself trustworthy evidence of a regression; re-run it or use a control before concluding a diff is real.

One transcription mistake surfaced by this process, not the pixel diff: the merged `.project-topbar` rule initially placed `margin-bottom: 16px` before the `margin: 0 auto` shorthand, which resets it — caught by Stylelint's `declaration-block-no-shorthand-property-overrides`, not by the pixel diff (the element is `position: absolute`, so `margin-bottom` doesn't currently affect layout — the pixel diff was correctly reporting "no visible change" even though the source no longer said what it meant). Fixed by reordering. This is a useful lesson: pixel-diffing proves visual equivalence, not source correctness — both checks matter.

`assets/css/styles.css` dropped from 4,505 to 4,368 lines (137 lines removed) with zero visual change. The remaining Stylelint finding (`pointer-events` declared twice in `.nav-pill`, line ~578) predates this work and is unrelated — left alone as out of scope.

**Breakpoint consolidation: done, properly verified.** The 390/768/1440px reference screenshots can't verify a breakpoint change — none of those widths fall in the 700–1200px range where every non-shared breakpoint in this stylesheet actually operates. Rather than guess or leave it as an open question, `tools/capture-references.js` gained a permanent `--widths=` flag (comma-separated, overrides the default three) so any future work can render a page at the exact boundary and gap widths that matter — documented in `tests/visual/reference/README.md`. It was then used to actually resolve every non-matching breakpoint, not just audit them:

- **900px/901px** (pill-menu compact-toggle switch) — a deliberate, correctly-implemented non-overlapping max/min pair. Left untouched.
- **820px** (apps index/detail grid) — tested by temporarily rendering `/apps/index.html` at 850px: the grid already looks fine there. Forcing it to the shared 920px would collapse to single-column ~100px earlier than necessary — a regression, not a cleanup. Left untouched.
- **980px** (contact form two-column layout) — tested by temporarily moving the breakpoint to 920px and rendering `/contact.html` at 930/950/970/979px: the two-column layout held up cleanly at every width, no cramping. **Consolidated to 920px** (the shared "content stack" value) for real, verified with evidence rather than assumption.
- **1120px** (homepage philosophy section) — tested by rendering `.home-philosophy` at 1160px: the two-column image/text layout already reads well. Forcing it to the shared 1180px would collapse it ~60px earlier than necessary — a regression. Left untouched.

Every non-shared breakpoint left in place is now documented by name and rationale in `docs/overhaul/DESIGN-TOKENS.md`'s new "Component-specific breakpoints" table, rather than sitting as an unexplained "legacy" number — the actual future-proofing outcome here wasn't merging numbers together, it was confirming (with real screenshots, not assumptions) which numbers are load-bearing design decisions and recording why. `tools/capture-references.js` also gained a permanent `apps-index` page entry (`/apps/index.html`), previously uncovered by any visual reference at all.

**Physical file split: done.** `assets/css/styles.css` is now a generated file, built from 11 partials in `assets/css-partials/` by `tools/build-css.js` (see `docs/overhaul/DESIGN-TOKENS.md` for the full partial-by-partial map). Mapping the file's actual section-comment structure first (rather than forcing the plan's literal 10 abstract categories) showed the source doesn't cleanly divide into "reset/layout/nav/forms/cards/carousels/modules" as cross-cutting concerns — it's overwhelmingly organised as shared basics up top followed by a long, page-by-page accumulation, where the *same* page (e.g. the project template, the projects listing) often has its CSS split across two widely-separated locations: an original section and a later "redesign 2026" section layered on top via source order (the exact pattern the duplicate-selector cleanup above already reconciled where the two overlapped). Forcing all carousel rules, all card rules, etc. into single topic files would require moving rules relative to each other across that page-by-page structure — real cascade risk, deferred (see below).

Given that reality, the split follows the file's own natural shape (11 files, roughly: tokens, base, navigation, homepage, an early-pages bundle, the project template, a misc-pages bundle, then four "redesign 2026" sections) rather than a topic taxonomy that wouldn't have been accurate. Every partial is an exact, verbatim slice of the original file — concatenating them back together was verified **byte-identical** to the pre-split source before a generated-file banner comment was added, which is the strongest possible proof this specific step introduced zero risk. `tools/build-css.js` runs automatically before every Eleventy build via an `eleventy.before` hook (covering `npm run build`, `npm start`, and `npm run check`), so a partial edit is never silently stale; `assets/css-partials/` sits outside `assets/css/` specifically so Eleventy's existing passthrough-copy rule doesn't ship it to `_site/`. `lint:css` and Prettier's CSS override now target the partials (the actual source of truth) instead of the generated file.

**Legacy token-alias retirement: done.** The `--sp-*` (`body.about-page`), `--cp-*` (`body.contact-page`, spanning `05-legacy-pages.css` and the thank-you-page section in `04-homepage.css`, since the thank-you template reuses the `contact-page` body class), `--hp-*` (`.home-section`/`.home-philosophy`/`.home-cta`), `--pp-*` (`body.projects-page`), and `--srv-*` (`body.concept-page`) aliases are gone. Each alias was a 1:1 mapping to exactly one shared token (e.g. `--cp-ink: var(--color-text-primary);`), confirmed per-prefix before touching anything, so retiring them was a mechanical substitution — replace every `var(--cp-ink)` usage with `var(--color-text-primary)` directly, then delete the orphaned alias declaration — rather than a judgment call about which value should win.

Verification still turned up a real scare worth recording: a full-suite `capture:references` diff showed `project-390.webp` at **15.6% pixels changed, max channel delta 240** — far outside any noise floor seen so far, and initially looked like a serious regression (the hero photo appeared to render as a blank grey box). Isolating and re-capturing just that one page showed the hero image rendering correctly, matching the reference — the failure was a one-off image-decode race during the 29-reference batch capture, not caused by the CSS change. The remaining small diffs (home, service, studio, all 0.04–0.33% with max channel delta under 35) reproduced at the exact same magnitudes as the capture-noise pattern already established during the duplicate-selector work, confirmed again with isolated re-captures. Lesson: a large diff is not automatically a real regression either — isolate and re-render the specific page before concluding anything, in both directions.

**True by-topic regrouping: started, with carousels.** `assets/css-partials/12-carousels.css` now holds the structural carousel mechanics (container, viewport, track, slide, controls, dots) for both the homepage featured-work carousel and the project-page hero gallery carousel, gathered from four different files: `03-navigation.css` (a picture-wrapper reset scoped to the project hero), `04-homepage.css` (`.dock-panel`, `.carousel`, `.viewport`, `.track`, `.slide`, `.ctrl`/`.prev`/`.next`, `.dots`/`.dot`), `06-project-template.css` (`.project-hero` container through `.project-hero-dots`), and `11-service-redesign.css` (an additive `height: 100%` rule). This is the first move that actually relocates rules *relative to each other* rather than just relative to themselves, so it needed a different kind of safety check than physical splitting:

- **Confirmed no selector collisions before moving anything.** The homepage carousel uses ID/class-based selectors (`.carousel`, `.dots`, `.dot`) and the project-hero carousel uses entirely different, disjoint class names (`.project-hero-track`, `[data-project-carousel-*]`). Since neither set of selectors can ever match the same DOM element, their relative order literally cannot affect rendering — this is what made the move safe despite touching four files.
- **Scoped "carousel" narrowly, on purpose.** Slide *content* styling (title, subtitle, tags, kicker, the homepage's `.featured-project__*` overlay) deliberately stayed in each page's own partial — it's page content that happens to render inside a carousel, not carousel mechanics. A card/content consolidation is a separate, future piece of work.
- **Left one exception in place rather than force it.** A `.project-hero`/`.project-hero-media img` responsive rule inside `11-service-redesign.css`'s `@media (max-width: 760px)` block stayed put — it's entangled with unrelated selectors (`.project-topbar`, `.project-title`) in the same media query, and splitting that query for one rule wasn't judged worth the added risk.
- **Caught two false leads before they became bugs.** `.button .dot` and `.project-cta-band .about-cta-button .dot` are a *different* concept (a decorative accent dot inside CTA buttons) that happens to share the class name `.dot` — correctly left in place, not moved into the carousel file.
- **A verification scare, resolved.** A full `capture:references` diff showed `project-390.webp` at a different page height (4499px vs 4617px) after the move — alarming at first glance. A control test (reverting to the pre-move partials via `git stash` and re-capturing) reproduced the *exact same* height difference with zero code changes, proving it's a pre-existing capture non-determinism in this stylesheet's `100svh`-based hero height (small-viewport-height units are inherently sensitive to headless-browser measurement timing), not something the carousel move caused. An interactive browser check surfaced the same kind of transient flakiness directly in the DOM (a hero image that failed to paint on first load, and one stale computed-style read that didn't match the DOM's actual inline style) — both resolved on a fresh read/repaint and were confirmed, via `npm run check`'s automated carousel interaction smoke test and direct DOM introspection, to reflect correct underlying state throughout.

**Not done:** further by-topic regrouping (cards, forms, buttons) and reducing `body.page`-specificity reliance. Any future topic needs the same pre-check this one got — confirm the candidate selectors don't collide with anything already in the file — before relocating anything.

### P2.3 — Define reusable interface components

Build and document the minimum shared component set:

- site header and overlay menu;
- global footer;
- primary, secondary, and text-link actions;
- section heading/kicker;
- completed project card;
- concept/in-progress project card with semantic status;
- service card;
- breadcrumb/back navigation;
- editorial media figure and caption;
- carousel/gallery;
- quote/testimonial block for genuine quotes only;
- process/deliverable list;
- form field, field error, form error summary, and success panel;
- call-to-action band.

Status must be real HTML text, not baked into artwork.

**Implementation note (July 2026):** audited, not yet built — see `docs/overhaul/COMPONENTS.md` for the full inventory. Findings:

- Header/overlay menu, hero brand mark, and the CTA band already exist as shared partials (`src/_includes/partials/`).
- Breadcrumb/back-navigation and the project/service card are each implemented three-to-four times with different class names per template (`.project-backlink`/`.app-backlink`/`.legal-backlink`; `.projects-card`/`.home-service-card`) rather than as one shared component — real duplication, confirmed by direct comparison, not assumed.
- Status (e.g. "Coming soon") is already real HTML text rather than baked into artwork — verified live in a preview during this pass — so that specific requirement is already met even though a named "concept card" component doesn't formally exist yet.
- The global footer and the quote/testimonial block are not just undocumented — they're genuinely blocked. No `<footer>` exists anywhere in the codebase, and building one now would mean inventing footer content ahead of the open navigation/footer decision in `docs/overhaul/DECISIONS.md`. No genuine testimonial content exists to build a real quote block around.

Consolidating the duplicated components (backlink, card) was not attempted here because it requires changing the CSS selectors those templates depend on — the same visual-regression risk as P2.2, and arguably part of the same piece of work. Recommended order: reconcile P2.2's duplicate-selector clusters first, then extract the now-unified backlink and card patterns into shared partials, verifying visually after each.

### P2.4 — Split JavaScript into small initialisers

Replace the monolithic main script with small modules or clearly separated functions for:

- navigation;
- carousels/galleries;
- form enhancement;
- scrollspy/current section, if still required;
- parallax or other optional visual enhancement;
- reduced-motion handling.

Remove dead references such as `#siteHeader` and `.projects-band` if they are no longer part of the rendered interface. Each initialiser should exit safely when its expected markup is absent.

No client application framework is needed.

**Implementation note (July 2026):** done. `assets/js/main.js` (612 lines) is retired; `#siteHeader` is still live (the header element still carries that id) and was kept, but `.projects-band` was confirmed genuinely dead — no template renders an element with that class — so the `band`/`bandTop`/`bandBottom`/`isProjectsBandActive` tracking was removed rather than relocated. Its corresponding CSS (`.is-projects-band` rules, now in `assets/css-partials/05-legacy-pages.css`) has an explicit prior comment noting it's deliberately kept as a harmless no-op fallback — investigated during P2.2 and left as-is for that reason, not removed. The remaining logic split three ways:

- `assets/js/navigation.js` — pill-anchor smooth scroll, the floating overlay menu (focus trap, inert background, Escape/outside-click), and the compact under-900px pill menu toggle.
- `assets/js/carousels.js` — the homepage featured-work carousel and the project hero gallery carousel, moved verbatim (not merged, despite their near-identical shape — the two have a real behavioural difference in slide `inert` handling, and unifying them is a design decision for P1.7/P4, not this ticket).
- `assets/js/scroll-effects.js` — background parallax and pill-menu scrollspy. These stayed in one file rather than splitting fully, because the original code deliberately shares a single `requestAnimationFrame` scheduler between them ("one scheduler... to avoid multiple per-scroll RAF pipelines competing for frame time" — see the file's own comment). Splitting them into two initialisers would have reintroduced the exact problem that comment documents avoiding.
- `assets/js/contact-form.js` was already its own file and needed no change.

No shared reduced-motion module was introduced — each file still computes `window.matchMedia("(prefers-reduced-motion: reduce)")` locally, matching the pattern already used in `contact-form.js`. This keeps every initialiser able to fail independently per the exit-safe requirement above, rather than depending on a shared global that would need a defined load order.

`src/_includes/layouts/base.njk`'s default `scripts` list and the two explicit overrides (`src/contact.njk`, `src/curated_services/service-pages.njk`) were updated to the new filenames. Verified with a full `npm run check` pass (including the accessibility suite's navigation/carousel/form interaction smoke tests) and manually in a live preview: overlay menu open/Escape-close and the homepage carousel's next-slide control both work identically to before the split.

### P2.5 — Standardise base templates and metadata

Create one dependable layout contract for:

- title and unique description;
- canonical URL;
- Open Graph and Twitter metadata;
- optional share image, dimensions, and alt text;
- body/template class;
- actual main landmark and skip-link target;
- indexing state;
- structured data hooks;
- header and footer inclusion;
- CSS/JavaScript asset references.

**Implementation note (July 2026):** `src/_includes/layouts/base.njk` already covered most of this contract from earlier phases — every template consistently sets a computed title/description, canonical URL, OG/Twitter tags, `htmlClass`/`bodyClass`, a real `<main id="main-content">` landmark matching the skip link, `noindex` state, and the shared script list. This pass closed the remaining gap: `og:image:alt` and `twitter:image:alt` now render from a fallback chain (`project.data.heroAlt` → `service.data.coverAlt` → the new `site.settings.shareImageAlt`), which required adding `shareImageAlt` to `settings.json`, `admin/config.yml`, and the `tools/check-content.js` contract check (mirroring how `shareImage` itself is validated) so a CMS save can't silently drop it. `og:image:width`/`height` are deliberately left for P5.5, which already owns validating a real 1200×630 share asset — adding dimensions now would mean guessing at a canonical asset ahead of that decision. Structured-data hooks remain limited to the homepage-only Organization block; broader breadcrumb/service structured data is P5.5's job once service claims are approved.

### P2.6 — Make asset versioning deterministic

Replace stylesheet versioning based on filesystem modification time with a content hash or build manifest. A fresh Netlify checkout must not change an asset URL when its contents are unchanged.

**Implementation note (July 2026):** done. `src/_data/site.js` now hashes the stylesheet's contents (SHA-256, truncated to 10 hex characters) instead of reading `statSync(...).mtimeMs`; the `?v=` query parameter is stable across rebuilds when the file is unchanged and changes only when its contents change. The `netlify.toml` caching split (immutable `/img/*`, one-day `/assets/*`) was left as-is — the versioning mechanism is still a query parameter on a fixed path, not a content-addressed filename, so the existing cache duration reasoning still applies.

### P2.7 — Pin and document the runtime

- Add an `.nvmrc` or equivalent version file.
- Add the supported Node range to `package.json` engines.
- Document install, development, build, CMS, check, and preview commands.
- Add formatter and lint scripts with stable versions.

**Implementation note (July 2026):** done. `.nvmrc` selects Node 22, `engines` requires ≥22.12 (the accessibility tooling's floor), and the README documents install/build/check/CMS/preview commands. Prettier (`3.9.5`), ESLint (`10.7.0` with `@eslint/js` `10.0.1` and `globals`), and Stylelint (`17.14.0` with `stylelint-config-standard`) are added as exact-pinned devDependencies with `format`, `format:check`, `lint:js`, and `lint:css` scripts.

These are deliberately *not* wired into `npm run check` yet, because the codebase predates the tooling: `lint:css` surfaces ~27 pre-existing duplicate CSS selectors (useful direct input to P2.2's dedup work, not a new regression) and `format:check` reports differences across most of the repository (Prettier has never run repository-wide). Wiring either into the required gate should wait until P2.2 has addressed the duplicate selectors and a deliberate one-time formatting pass has been reviewed as its own change, so the gate doesn't start red.

### Phase 2 exit gate

- [ ] Tokens and components are documented and used in at least one representative page.
- [ ] New CSS structure compiles to one production asset.
- [ ] Visual comparisons show no unintended regression on pages not yet redesigned.
- [ ] JavaScript initialisers fail safely and contain no known dead DOM queries.
- [ ] Layout metadata contract covers all public templates.
- [ ] Asset URLs are based on content rather than checkout timestamps.
- [ ] Runtime and development commands are pinned and documented.

## 9. Phase 3 — Information architecture and content migration

### Objective

Build the new site structure around approved, credible content before finishing detailed visual polish.

### P3.1 — Implement the global architecture

Add the approved primary navigation and a global footer across public pages.

The footer should include:

- a concise contact route;
- primary navigation;
- legal/company information;
- real social links only;
- app support and related documents in a quiet, clearly labelled area.

### P3.2 — Create a Services index

Add `/services/` as the clear parent of the service pages. It should explain:

- who each service is for;
- the typical scope;
- core deliverables;
- the relationship between services;
- how to start an enquiry.

Each service page must link back to the index through a breadcrumb or clear parent link.

### P3.3 — Restructure the Work index

Use this order:

1. completed work;
2. optional featured completed project;
3. concepts and in-progress work in a separate, explicitly labelled section.

Requirements:

- do not allow coming-soon cards to dominate the first viewport or first row;
- use clean imagery without baked-in status wording;
- represent status, image type, and project metadata in semantic HTML;
- do not link to empty case-study shells;
- omit the second section entirely if it adds no genuine value.

### P3.4 — Create the complete case-study model

For each selected completed project, structure available content around:

- concise overview;
- project facts and services;
- brief or design challenge;
- approach and key interventions;
- materials, spatial decisions, or notable details;
- outcome;
- clearly labelled photography/visualisations;
- image captions where they add meaning;
- next-project or related-work path;
- relevant enquiry CTA.

Do not force every project into identical word counts or modules, but maintain a predictable reading hierarchy.

### P3.5 — Rewrite the homepage content hierarchy

Prepare content for this sequence:

1. **Hero:** a concrete value proposition with location/market context, primary “Start a project” action, and secondary “View work” action.
2. **Featured work:** one strong completed case study rather than an anonymous gallery.
3. **Services:** concise overview linking to the Services index and relevant service pages.
4. **Process and deliverables:** what working together looks like.
5. **Credibility:** named studio/person, relevant experience, and only genuine testimonials, press, collaborators, or credentials.
6. **More completed work:** selected evidence rather than filler.
7. **Enquiry CTA.**
8. **Global footer.**

### P3.6 — Strengthen Studio content

The Studio page should answer:

- who is behind the work;
- where the studio operates;
- what perspective or experience differentiates it;
- how projects are approached;
- what clients can expect;
- how to make contact.

Move unrelated app documents out of the main Studio narrative while preserving their public destinations.

### P3.7 — Replace baked-in cover text

Replace service and project imagery that contains status/title text with clean, text-free artwork. This prevents mobile cropping from removing essential information and ensures text remains readable, responsive, translatable, indexable, and accessible.

If mobile crops remain unsuitable, use responsive art direction with a dedicated mobile crop through `<picture>`.

### P3.8 — Prepare unique page metadata

Write a unique title and description for:

- homepage;
- Work;
- Services;
- each service;
- Studio;
- Contact;
- every indexable project;
- app/support/legal pages that need to remain indexed.

The homepage title should state the genuine service and location positioning—for example, “Interior Design Studio London | Curated Design”—only after the positioning is approved.

### P3.9 — Prepare redirects and content migration

If clean URLs were approved:

- implement permanent redirects for every old public URL;
- update all internal links, canonicals, sitemap entries, structured data, and CMS preview URLs;
- preserve external app support/legal URLs or redirect them permanently;
- test query strings and fragment links where relevant.

### Phase 3 exit gate

- [ ] Global navigation and footer architecture approved.
- [ ] Services index has real content and working child-page paths.
- [ ] Completed and incomplete work are clearly separated.
- [ ] At least two or three launch-quality case studies are content-complete, or a reduced-scope launch is explicitly approved.
- [ ] No essential wording remains baked into project/service artwork.
- [ ] Homepage and Studio copy contain substantiated, specific claims.
- [ ] Unique metadata is prepared for every indexable page.
- [ ] Redirect map is complete if URLs are changing.

## 10. Phase 4 — Page-by-page UI and UX overhaul

### Objective

Apply the shared system to real content, preserving the editorial character while making the experience clearer, more credible, and easier to use.

### P4.1 — Global header and footer

- Refine the fixed header so the brand remains legible over every background.
- Keep the menu interaction consistent at all breakpoints.
- Make the primary enquiry route visible without overwhelming the editorial presentation.
- Ensure the footer provides a dependable end-of-page navigation and contact route.
- Check long page titles, zoom to 200%, and browser text enlargement.

### P4.2 — Homepage

- Implement the approved content sequence from P3.5.
- Choose a deliberate LCP element; normally the hero image or featured-work image, not two competing high-priority assets.
- Replace the anonymous featured carousel with a linked, labelled version or a single high-quality featured case study.
- Make the primary value proposition understandable without scrolling.
- Maintain generous editorial spacing without delaying the first proof point excessively.
- Use clear CTA hierarchy and avoid repeated competing buttons.

### P4.3 — Work index

- Lead with completed work.
- Give project cards useful text beyond the title: project type, location, scope, or status where appropriate.
- Make card click/tap behaviour predictable and keyboard accessible.
- Use consistent image ratios while allowing selected editorial variation.
- Keep concepts/in-progress visually secondary and unambiguously labelled.

### P4.4 — Project case study

- Render project introduction fields that were previously lost.
- Use an accessible, deduplicated gallery.
- Make project facts easy to scan.
- Maintain a comfortable reading measure for narrative text.
- Provide captions and honest image-type labels where relevant.
- Add related/next project navigation and an enquiry CTA.
- Verify that a one-image project and a long multi-image project both degrade gracefully.

### P4.5 — Services index and service pages

- Provide a coherent overview on the index.
- Give each service page a clear audience, scope, deliverables, process, and next step.
- Replace mobile-cropped text artwork.
- Implement visible coming-soon behaviour if a service is not ready; do not expose an empty service shell.
- Standardise embedded enquiry forms and budget language.
- Add breadcrumb/parent navigation.

### P4.6 — Studio

- Balance philosophy with real human and operational credibility.
- Introduce the person or studio behind the work with approved imagery and facts.
- Make services, Work, and Contact natural next steps.
- Remove app/support-document prominence from the editorial page body.

### P4.7 — Contact and forms

- Clarify the expected enquiry process and response expectations if these can be guaranteed.
- Reduce fields to those needed to qualify or answer an enquiry.
- Make required/optional state explicit.
- Ensure validation is announced and visually clear.
- Test error recovery without erasing the visitor's entries.
- Confirm success messaging and thank-you page continue the brand experience.

### P4.8 — Supporting pages

- Create a branded, useful 404 page with routes to Work, Services, and Contact.
- Bring privacy, terms, and app-support pages into the shared shell without making them visually dominant.
- Keep legal content readable and easy to update.
- Ensure thank-you pages cannot become search landing pages.

### P4.9 — Responsive and input-mode review

For every template, validate:

- 320–390px small phones;
- 768px tablet/narrow desktop;
- 1024–1440px desktop;
- wider displays where editorial line lengths could become excessive;
- keyboard-only use;
- touch input;
- browser zoom at 200%;
- reduced motion;
- high-content cases such as long titles and long validation errors.

### Phase 4 exit gate

- [ ] Every core page is approved at 390px, 768px, and 1440px.
- [ ] No page-level horizontal overflow is present at 320px or wider.
- [ ] All essential tasks are possible with keyboard, touch, and without JavaScript where applicable.
- [ ] Completed work and studio credibility appear before speculative content.
- [ ] Form, carousel, menu, and CTA states are consistent across templates.
- [ ] Visual-regression changes are reviewed and intentional.

## 11. Phase 5 — Performance, SEO, security, and CMS hardening

### Objective

Optimise the stable implementation, strengthen platform safeguards, and make the publishing workflow dependable.

### P5.1 — Self-host and subset fonts

- Replace the Google Fonts request chain with locally hosted font files.
- Include only the families, styles, weights, and character subsets actually used.
- Preload only the fonts required for above-the-fold content.
- Apply an appropriate `font-display` strategy.
- Define robust fallbacks and minimise visible metric shifts.

This addresses both performance and third-party privacy concerns.

### P5.2 — Improve responsive image delivery

- Add intermediate responsive widths such as 600/640/768px instead of jumping from 400 to 800 to 1200.
- Tighten `sizes` values to reflect real rendered widths.
- Add smaller hero/background candidates for mobile; the audited mobile background selected a 1280px AVIF unnecessarily.
- Use `<picture>` where crop/art direction differs, not only resolution.
- Keep width and height attributes or aspect-ratio reservations to protect CLS.
- Set loading and fetch priority deliberately.
- Ensure carousels do not request 800px images for approximately 340px display widths.
- Remove orphaned generated derivatives and avoid passing unused originals into `_site`.

**Implementation note (July 2026):** responsive derivatives are generated by `@11ty/eleventy-img` into `/img/` with content-hashed filenames, already cached immutable by `netlify.toml`. New width candidates therefore carry no cache-invalidation cost; the work is in the shortcode width lists and `sizes` attributes, not the hosting layer.

### P5.3 — Reduce render-blocking work and layout thrashing

- Keep the production CSS bundle small enough that critical rendering is not delayed unnecessarily.
- Consider minimal critical CSS only after stylesheet consolidation; do not duplicate large style blocks.
- Batch DOM reads and writes.
- Move layout measurement out of immediate write sequences.
- Remove the forced-reflow pattern observed around carousel initialisation and later navigation/layout reads.
- Defer non-essential enhancement until after first render.

### P5.4 — Establish a single LCP strategy

Avoid giving both the homepage background and carousel media competing high priority. Identify the expected LCP element per major template and:

- preload or prioritise only when justified;
- provide the correct responsive source early;
- avoid JavaScript-dependent discovery;
- verify that font loading does not replace it as an avoidable bottleneck.

### P5.5 — Complete technical SEO

- Add unique core-page metadata from Phase 3.
- Add Open Graph image width, height, and alt metadata.
- Add Twitter image alt metadata.
- Validate a real 1200-by-630px share asset.
- Add breadcrumb structured data where breadcrumbs exist.
- Add appropriate `ProfessionalService` and service structured data using only truthful fields.
- Retain valid organisation data.
- Add sitemap `lastmod` values sourced from dependable content dates.
- Validate canonicals, robots directives, sitemap membership, and redirects.
- Keep thin/incomplete pages out of search until they provide standalone value.

### P5.6 — Add security headers

Configure and test:

- Content Security Policy, with separate needs considered for public pages and `/admin/`;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- `frame-ancestors` or an equivalent frame restriction;
- continued HSTS behaviour.

Start CSP in report-only mode on a deploy preview if necessary, then tighten before production.

### P5.7 — Harden the admin and CMS workflow

- Self-host the Decap admin script or provide dependable integrity/version protection instead of an unverified third-party runtime include.
- Keep admin pages `noindex`.
- If using Decap as primary, enable an editorial workflow or branch/deploy-preview review rather than direct unreviewed publication to `main`.
- Generate CMS schemas/configuration from the shared content contract where practical.
- Test create, edit, draft, publish, unpublish/archive, image upload, and settings changes.

### P5.8 — Harden the custom visual CMS if retained

The local server already benefits from loopback-only binding and path sanitisation. Add:

- atomic file writes;
- schema validation before writes;
- allowed file-type validation;
- image dimension checks;
- upload and request size limits;
- clear error recovery and backup behaviour;
- removal of duplicated response headers;
- tests for path traversal and malformed content;
- generated/shared selectors or data bindings rather than brittle DOM-class queries.

If the editor cannot share the primary schema reliably, remove it from the supported publishing path.

### P5.9 — Review privacy and legal content

- Update the privacy notice for the actual form, hosting, font, analytics, spam, and CMS services in use.
- Avoid claiming that the audit constitutes legal review.
- Obtain professional review where required.
- Reassess consent UI only if the final service selection requires it.

### P5.10 — Enforce quality budgets

Use production-like builds and the median of three mobile runs. Target:

- Lighthouse performance: at least 85;
- Lighthouse accessibility: 100 on audited representative pages;
- Lighthouse best practices: 100;
- Lighthouse technical SEO: 100 for indexable pages;
- LCP: at most 2.5 seconds in the agreed lab profile;
- TBT: at most 200ms;
- CLS: at most 0.1;
- no critical or serious automated accessibility violations;
- no broken internal links or missing local assets;
- no unexpected oversized responsive-image selection;
- approximately 400 KiB or less initial transfer on the homepage unless an approved visual asset justifies an exception.

If field data becomes available, use Core Web Vitals as the ultimate performance signal and treat Lighthouse as a controlled diagnostic.

### Phase 5 exit gate

- [ ] Fonts are self-hosted and unused variants removed.
- [ ] Responsive-image selection is verified at target viewport sizes.
- [ ] Median performance and accessibility budgets pass.
- [ ] Structured data validates and contains only truthful content.
- [ ] Redirects, canonicals, robots, and sitemap agree.
- [ ] Security headers work on public and admin routes.
- [ ] The chosen CMS passes a full content round-trip.
- [ ] Privacy/legal changes have the required review.

## 12. Phase 6 — UAT, launch, and measurement

### Objective

Release safely, verify production behaviour, and establish a short post-launch improvement loop.

### P6.1 — Complete the automated suite

The final `npm run check` and CI workflow should cover:

- production build;
- content schema and front-matter rules;
- internal links and local assets;
- HTML validation;
- JavaScript and CSS linting;
- representative Axe scans;
- navigation keyboard/focus behaviour;
- carousel controls and active state;
- form validation and result focus;
- public/draft/archive collection rules;
- sitemap, robots, canonical, and `noindex` agreement;
- unique metadata requirements;
- structured-data validation where automatable.

### P6.2 — Add browser journeys

Use Playwright or an equivalent tool for at least these journeys:

1. Home → featured work → project → enquiry.
2. Home → Services → service page → service enquiry.
3. Work filtering/sections → completed project.
4. Keyboard open/traverse/close navigation.
5. Contact native validation → staged successful submission.
6. Invalid form response → error recovery without lost data.
7. 404 → recovery to a core destination.

Run viewport coverage at 390px, 768px, and 1440px.

**Implementation note (July 2026):** the repository already drives a browser through `puppeteer-core` for screenshots and Axe scans. Before adding Playwright, decide deliberately: either build the journeys on the existing puppeteer harness to keep one browser stack, or adopt Playwright for its test runner and accept two harnesses. Do not drift into both without a recorded reason.

### P6.3 — Conduct manual accessibility UAT

Check:

- keyboard order and visible focus;
- focus trapping and restoration;
- VoiceOver or another screen-reader smoke test;
- 200% zoom and enlarged text;
- reduced motion;
- colour contrast;
- form error announcement;
- carousel and menu announcements;
- meaningful alternative text and decorative-image treatment.

### P6.4 — Conduct content and brand QA

Verify:

- spelling, grammar, punctuation, and tone;
- client/project facts;
- location and service claims;
- photography/visualisation labels;
- captions and alt text;
- permissions and credits;
- contact details;
- budget ranges;
- social links;
- app-support destinations;
- legal dates and company details.

### P6.5 — Validate a deploy preview

On the final production-like preview:

- crawl all public routes;
- run three Lighthouse tests and record the median;
- inspect headers and caching;
- exercise the CMS preview/editorial workflow;
- test Netlify form capture without creating a false production lead;
- test redirects and the 404 page;
- verify share previews;
- inspect a representative range of real mobile devices if available.

### P6.6 — Prepare release and rollback

- Tag or record the last known-good production commit.
- Keep the release change set reviewable.
- Document how to roll Netlify back to the last successful deploy.
- Export or back up editable content before schema migration.
- Schedule launch when someone can verify the production site immediately afterwards.

### P6.7 — Perform production smoke tests

Immediately after launch, verify:

- homepage and all primary navigation destinations;
- representative project and service pages;
- images and fonts;
- canonical and indexing directives;
- sitemap and robots;
- redirects;
- forms and thank-you behaviour;
- security headers;
- CMS login/editor flow;
- 404 response and recovery links.

### P6.8 — Run a post-launch review

At approximately 48 hours and again after 2–4 weeks:

- review form delivery and spam levels;
- inspect errors and failed asset requests;
- review Core Web Vitals if measurement was approved;
- review search indexing and redirect issues;
- assess which Work and Services routes visitors actually use;
- record content gaps and small UX refinements;
- prioritise findings rather than beginning another broad redesign.

### Phase 6 exit gate

- [ ] CI and browser journeys pass.
- [ ] Manual accessibility, content, and brand UAT are signed off.
- [ ] Production-like preview passes the launch checklist.
- [ ] Rollback procedure and content backup are confirmed.
- [ ] Production smoke test passes.
- [ ] Post-launch review dates and owner are recorded.

## 13. Recommended ticket order

This is the practical dependency order for issue tracking. Content work can run alongside engineering after the Phase 0 inventory.

As of July 2026, groups 1–4 have largely landed (see the status summary in §1) and group 5 is underway with P2.1 and P2.7 complete. The current front is P2.2 stylesheet reorganisation; groups 6–7 remain gated on the content decisions in `docs/overhaul/DECISIONS.md`.

| Order | Ticket group | Why it comes here |
| ---: | --- | --- |
| 1 | P0.1–P0.6 decisions and baseline | Prevents designing around content that will not ship |
| 2 | P1.1–P1.2 checks and snapshots | Protects the existing working behaviour before refactoring |
| 3 | P1.3–P1.7 accessibility and interaction | Removes critical barriers on the current live experience |
| 4 | P1.8–P1.10 content contract, forms, indexing | Stops data loss, broken publishing, and thin pages reaching search |
| 5 | P2.1–P2.7 foundations | Creates a shared system before new page construction |
| 6 | P3.1–P3.9 IA and content migration | Builds the new structure with approved real material |
| 7 | P4.1–P4.9 page implementation | Applies the system consistently across templates |
| 8 | P5.1–P5.4 performance | Optimises stable markup and final media choices |
| 9 | P5.5–P5.9 SEO, security, CMS, privacy | Hardens the final routes, policies, and publishing workflow |
| 10 | P5.10 and P6.1–P6.8 release | Enforces budgets, completes UAT, launches, and measures |

## 14. Parallel content workstream

Content is the critical path even when engineering proceeds in parallel. Assign owners and target dates for:

- project classification;
- case-study interviews or fact collection;
- image selection and retouching;
- image permissions and credits;
- text-free replacement covers;
- studio biography and portrait/environmental imagery;
- service definitions, deliverables, process, and budget guidance;
- genuine testimonials or collaborator approval;
- page titles and descriptions;
- alt text and captions;
- company/contact details;
- privacy and terms review.

**Hard gate:** do not complete the homepage and Work redesign using placeholder claims or multiple “Coming Soon” projects. If enough finished work is not available, reduce the portfolio scope and present it honestly.

## 15. Test matrix

| Area | Automated | Manual |
| --- | --- | --- |
| Build/content | Eleventy build, schema validation, collection rules | CMS editing and editorial workflow |
| Links/assets | Crawl internal links and local assets | External contact/social/support destinations |
| HTML/SEO | Titles, descriptions, H1, main, canonical, robots, sitemap, JSON-LD | Search-preview and share-preview review |
| Accessibility | Axe on representative templates | Keyboard, screen reader, zoom, contrast, reduced motion |
| Responsive UI | Screenshot comparison at 390/768/1440 | Real-device touch and orientation checks |
| Navigation | Open/close, Escape, focus restoration, current page | Screen-reader announcement and outside-click judgement |
| Carousels | Controls, active state, image uniqueness | Swipe feel, motion comfort, content comprehension |
| Forms | Native validation, staged response, focus movement | Copy clarity, error recovery, real Netlify capture on staging |
| Performance | Three-run Lighthouse median, asset budgets | Visual loading quality on constrained connection |
| Security | Header assertions, dependency audit | CSP/admin/editor workflow review |

## 16. Definition of done for every ticket

A ticket is complete only when:

- its acceptance criteria pass;
- it works at agreed responsive breakpoints;
- keyboard and focus behaviour have been considered;
- reduced-motion behaviour has been considered where relevant;
- content is real or clearly marked as an approved temporary state;
- CMS fields and public rendering remain in sync;
- automated tests are added or updated in proportion to risk;
- no unrelated visual or functional regression is introduced;
- the production build passes;
- documentation is updated when behaviour, schema, or workflow changes.

## 17. Primary risks and mitigations

### Risk: insufficient completed portfolio content

**Impact:** the redesigned site still lacks credibility.

**Mitigation:** make the content inventory the first gate; launch with fewer, stronger projects rather than six equally prominent incomplete entries.

### Risk: two CMS implementations drift again

**Impact:** editors lose data or public templates omit fields.

**Mitigation:** choose one primary workflow, generate/share the schema, and add round-trip contract tests.

### Risk: CSS refactor changes the visual identity

**Impact:** the overhaul becomes generic or introduces widespread regressions.

**Mitigation:** capture reference screenshots first, migrate component by component, and require intentional visual-diff review.

### Risk: URL cleanup harms search or app support

**Impact:** broken inbound links and lost discoverability.

**Mitigation:** approve a complete redirect map before changing permalinks; preserve externally embedded support/legal paths.

### Risk: performance work degrades image quality

**Impact:** the portfolio loses its premium visual character.

**Mitigation:** use responsive selection and art direction before aggressive compression; review key images visually on high-density displays.

### Risk: security policy breaks the admin

**Impact:** publishing becomes unavailable.

**Mitigation:** test path-specific CSP on deploy previews, use report-only mode initially, and retain a documented rollback.

### Risk: automated scores become the design target

**Impact:** good editorial choices are removed for marginal synthetic gains.

**Mitigation:** use budgets as guardrails, repeat tests, document justified exceptions, and prefer field data when available.

## 18. Launch decision checklist

The overhaul is ready to launch only when all of the following are true:

- [ ] The public portfolio prioritises completed, credible work.
- [ ] Claims, project facts, images, and permissions are approved.
- [ ] Primary navigation includes Work, Services, Studio, and Contact.
- [ ] The site has a global footer and a branded 404 page.
- [ ] Core pages have unique metadata.
- [ ] Drafts, archived content, and incomplete pages follow the approved indexing rules.
- [ ] No critical or serious accessibility violations remain on core templates.
- [ ] Keyboard navigation, focus management, reduced motion, and form errors pass manual review.
- [ ] The chosen CMS can create, edit, preview, publish, and archive without data loss.
- [ ] Forms work in enhanced and fallback modes.
- [ ] Responsive images and self-hosted fonts meet the agreed performance budget.
- [ ] Median mobile Lighthouse gates pass or any exception is explicitly documented.
- [ ] Redirects, canonicals, sitemap, robots, and structured data validate.
- [ ] Security headers are enabled and admin access still works.
- [ ] CI, browser journeys, manual UAT, and production-like preview checks pass.
- [ ] Rollback, content backup, and post-launch review owners are confirmed.

## 19. Suggested first implementation milestone

The safest first milestone is a production-ready improvement to the existing site, before the broader redesign:

1. complete the project/content classification;
2. add baseline checks and screenshots;
3. fix navigation accessibility and focus behaviour;
4. repair contrast, target sizes, landmarks, and reduced motion;
5. deduplicate the project gallery;
6. repair CMS/template field mismatches;
7. standardise form success/error behaviour;
8. remove thin or incomplete pages from indexing;
9. deploy and verify those improvements;
10. begin the shared design-system and content workstreams.

This milestone improves the live site materially without waiting for the complete overhaul and creates a safer base for all subsequent work.
