# Curated Design Website — Overhaul Build Plan

## 1. Purpose

This plan turns the full site audit into an ordered implementation programme. It preserves the strongest parts of the current site—the editorial art direction, restrained palette, typography, image-led presentation, and static Eleventy architecture—while correcting the content, UX, accessibility, performance, CMS, and maintainability issues identified in the audit.

The work is intentionally ordered so that correctness and content decisions come before a visual rebuild. The new interface should not be used to disguise incomplete portfolio material or unresolved content structure.

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

### P2.6 — Make asset versioning deterministic

Replace stylesheet versioning based on filesystem modification time with a content hash or build manifest. A fresh Netlify checkout must not change an asset URL when its contents are unchanged.

### P2.7 — Pin and document the runtime

- Add an `.nvmrc` or equivalent version file.
- Add the supported Node range to `package.json` engines.
- Document install, development, build, CMS, check, and preview commands.
- Add formatter and lint scripts with stable versions.

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
