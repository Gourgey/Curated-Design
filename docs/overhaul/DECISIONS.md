# Overhaul decision log

Last updated: 15 July 2026

This log separates confirmed implementation facts from decisions that need business approval. Open decisions do not block the current safety and correctness milestone unless noted.

| Decision | Current working position | State | Needed before |
| --- | --- | --- | --- |
| Primary navigation | No Services index for now — footer/nav should stay to the current three routes (Work, Studio, Contact); revisit only if a Services index gets built later | **Decided (16 July 2026, owner: site owner)** | — |
| Secondary/footer destinations | Footer should include: contact + the three main nav routes (Work, Studio, Contact) — no Services link; all existing legal/company pages (Company Information, Privacy Notice, Terms of Business); app-support links, shown visibly (not de-emphasised); no social profile links — none exist to add | **Decided (16 July 2026, owner: site owner)** | Ready for Global footer build (P3.1) |
| Primary CMS | Use Decap as the provisional primary structured editor; keep the custom visual CMS outside the supported publishing path until it demonstrably shares the same contract | Provisional — supported by the current README and configuration | CMS hardening and schema generation |
| URL strategy | Retain current `.html` routes for now; do not change permalinks without an approved redirect map | Provisional | Any clean-URL migration |
| Analytics | No analytics integration was found in the repository; do not add one by default | Open — hosting-level tools also need confirmation | Privacy review and Phase 5 |
| Project indexing | Published projects may be indexed; coming-soon teasers are `noindex` and excluded from the sitemap; drafts are not generated | Implemented | Revisit when a teaser becomes a complete case study |
| Case-study launch threshold | Launch with the single published case study (Marylebone Lobby) rather than waiting for two or three; revisit only if/when more case studies are ready | **Decided (16 July 2026, owner: site owner)** | Ready for Phase 3–4 homepage/Work redesign |
| Quote/testimonial block | No genuine client testimonial exists to publish; do not build a testimonial section for this launch | **Decided (16 July 2026, owner: site owner)** | — |
| Enquiry qualification fields | Preserve the current required fields while project type remains optional; do not tighten or remove qualification fields without an owner confirming what the studio genuinely needs | Open business decision | Final form-copy approval |
| Enquiry budget guidance | Preserve the current general-contact and service-specific examples; the £80–150k and £5–15k ranges may reflect different scopes but need explicit approval before they are reconciled | Open business decision | Final form-copy approval |
| Image permissions | Treat all current publication rights and credits as unconfirmed until an owner signs them off | Open, hard gate | Final content approval |
| Legal review | Do not treat implementation review as legal approval | Open, hard gate | Privacy/terms release |
| Runtime | Node 22 is selected in `.nvmrc`; package dependencies require Node 22.12 or newer; CI consumes the same version file | Implemented; local verification on 15 July 2026 used Node 25.8.1 | Revisit only when upgrading the runtime |

## Owners still required

- Project facts and public/draft/private classification: unassigned.
- Image ownership, permission, type, and credit: unassigned.
- Homepage, Studio, and service copy approval: unassigned.
- Privacy and terms review: unassigned.
- URL migration approval: unassigned.
- Analytics and consent decision: unassigned.

## Decisions deliberately not inferred

The implementation must not infer testimonials, awards, credentials, client outcomes, service scope, budget thresholds, response times, social profiles, or company/legal details that are not supported by approved source material.
