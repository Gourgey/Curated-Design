# Overhaul decision log

Last updated: 15 July 2026

This log separates confirmed implementation facts from decisions that need business approval. Open decisions do not block the current safety and correctness milestone unless noted.

| Decision | Current working position | State | Needed before |
| --- | --- | --- | --- |
| Primary navigation | Target structure is Work, Services, Studio, Contact | Open — current navigation has Home, Work, Studio, Contact and no Services index | Phase 3 information architecture |
| Secondary/footer destinations | Include contact, primary routes, legal/company information, real social profiles, and quiet app-support links | Open | Global footer build |
| Primary CMS | Use Decap as the provisional primary structured editor; keep the custom visual CMS outside the supported publishing path until it demonstrably shares the same contract | Provisional — supported by the current README and configuration | CMS hardening and schema generation |
| URL strategy | Retain current `.html` routes for now; do not change permalinks without an approved redirect map | Provisional | Any clean-URL migration |
| Analytics | No analytics integration was found in the repository; do not add one by default | Open — hosting-level tools also need confirmation | Privacy review and Phase 5 |
| Project indexing | Published projects may be indexed; coming-soon teasers are `noindex` and excluded from the sitemap; drafts are not generated | Implemented | Revisit when a teaser becomes a complete case study |
| Case-study launch threshold | Aim for at least two or three approved complete case studies; if unavailable, launch a deliberately smaller portfolio | Open business/content decision | Homepage and Work redesign approval |
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
