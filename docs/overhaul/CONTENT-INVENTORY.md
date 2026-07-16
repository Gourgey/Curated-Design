# Overhaul content inventory

Last updated: 15 July 2026

This is the Phase 0 working inventory for the existing project collection. It records what the repository can establish without inventing project facts or assuming image rights. Items marked **confirmation required** need a business or content owner before the redesign can treat them as approved claims.

## Current classification

| Project | Type and location | Repository status | Public treatment | Image type and rights | Case-study readiness | Required follow-up |
| --- | --- | --- | --- | --- | --- | --- |
| Marylebone Lobby | Residential lobby; Marylebone, London | `published` | Linked and indexable | Image type is not explicitly recorded; publication permission is unconfirmed | Best current candidate; the only complete case study in the content model | Confirm whether imagery is photography or visualisation, rights/credits, client-approved facts, outcome wording, and whether 2026 is correct |
| Sandbanks Residence | Residential; Sandbanks | `coming_soon` | Linked teaser; `noindex`; excluded from sitemap | Alt text calls the image an exterior visual; rights are unconfirmed | Not launch-quality as a full case study | Confirm project status, image type/rights, brief, interventions, outcome, and whether it should remain public |
| Botanical Residence | Residential; location not recorded | `coming_soon` | Linked teaser; `noindex`; excluded from sitemap | Alt text calls the image a concept visual; rights are unconfirmed | Not launch-quality as a full case study | Confirm location, real project status, image type/rights, brief, interventions, and outcome |
| Marylebone Terrace | Residential terrace; Marylebone, London | `coming_soon` | Linked teaser; `noindex`; excluded from sitemap | Image type and rights are unconfirmed | Not launch-quality as a full case study | Confirm project status, image type/rights, brief, interventions, and outcome |
| Garden Restaurant | Hospitality; location not recorded | `coming_soon` | Linked teaser; `noindex`; excluded from sitemap | Source and hero imagery differ; image type and rights are unconfirmed | Not launch-quality as a full case study | Confirm whether the shown imagery belongs to this project, location, project status, rights, and supporting facts |
| Shoreditch Office | Commercial workplace; Shoreditch, London | `coming_soon` | Linked teaser; `noindex`; excluded from sitemap | Image type and rights are unconfirmed | Not launch-quality as a full case study | Confirm project status, image type/rights, brief, interventions, and outcome |
| Marylebone Residence Lobby (archived draft) | Residential lobby; Marylebone, London | `draft` | Not generated, listed, or indexed | Gallery contains placeholders only; rights are unconfirmed | Superseded by the published Marylebone Lobby entry | Confirm it can be deleted after content backup, or retain it as an explicitly archived source record |

## Inventory findings

- The repository contains seven project records: one published case study, five coming-soon teasers, and one archived draft.
- The overhaul target of two or three credible complete case studies is not yet met.
- Coming-soon pages remain reachable for existing links, but are now excluded from the sitemap and marked `noindex, follow`.
- The archived draft is filtered out of page generation, relations, listings, preview data, and the sitemap.
- No project currently records image ownership, publication permission, credit, or an explicit photography/visualisation type as structured fields.
- Garden Restaurant needs early review because its card and hero use different image sources and the hero filename refers to the older “Monet Terrace” asset set.

## Approval checklist

For every project intended for the redesigned public portfolio, assign a content owner and confirm:

- [ ] public title, location, type, and year;
- [ ] completed, in-progress, concept, archived, or private status;
- [ ] image type for every image;
- [ ] ownership, publication permission, and credit;
- [ ] approved brief, constraints, interventions, and outcome;
- [ ] indexable, teaser/noindex, draft, private, or remove treatment;
- [ ] whether it qualifies as a launch case study.

## Current launch constraint

Do not complete the new homepage or Work hierarchy around the present five coming-soon projects. Either approve and complete at least one or two more genuine case studies, or explicitly approve a smaller portfolio led by Marylebone Lobby.

## Case-study model gaps (P3.4, 16 July 2026)

Building out the case-study content model against Marylebone Lobby (the one published project) surfaced two specific, still-open follow-ups from the row above, now backed by real schema capability rather than a general note:

- **Outcome wording.** The template's `extraSections` already supports an arbitrary heading/text block, so an editor can add an "Outcome" section as soon as approved outcome wording exists. None has been written for Marylebone Lobby yet.
- **Image type (photography vs. visualisation).** `admin/config.yml` now exposes an optional `imageType` field per gallery image (and a matching optional `caption` field). Neither is set on any current project's gallery images — setting `imageType` without confirmation would assert a rights/provenance claim this inventory already lists as unconfirmed.

Both are content/business decisions, not implementation gaps — do not fill either in without an owner's sign-off.
