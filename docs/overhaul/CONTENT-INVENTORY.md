# Overhaul content inventory

Last updated: 16 July 2026

This is the Phase 0 working inventory for the existing project collection. It records what the repository can establish without inventing project facts or assuming image rights. Items marked **confirmation required** need a business or content owner before the redesign can treat them as approved claims.

**Inventory approved as-is (16 July 2026, owner: site owner).** The classification table below — public title, location, type, status, and public treatment per project — is confirmed accurate. This does not extend to the still-open per-project items in the approval checklist below (image rights/type/ownership, approved brief/outcome wording): those remain unconfirmed, now with the site owner as the named owner for closing them out.

## Current classification

| Project | Type and location | Repository status | Public treatment | Image type and rights | Case-study readiness | Required follow-up |
| --- | --- | --- | --- | --- | --- | --- |
| Marylebone Lobby | Residential lobby; Marylebone, London | `published` | Linked and indexable | Confirmed 16 July 2026 (owner: site owner): all images are photography taken by the site owner; gallery images now carry `imageType: Photography`. Outcome wording confirmed and published (see Outcome section). Client-approved facts and whether "2026" is correct remain unconfirmed | Best current candidate; the only complete case study in the content model | Confirm client-approved facts and whether 2026 is correct |
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

- [x] public title, location, type, and year — confirmed by the 16 July 2026 inventory approval above.
- [x] completed, in-progress, concept, archived, or private status — confirmed by the 16 July 2026 inventory approval above.
- [ ] image type for every image — owner: site owner; confirmed for Marylebone Lobby (photography, 16 July 2026), not yet confirmed for any other project.
- [ ] ownership, publication permission, and credit — owner: site owner; confirmed for Marylebone Lobby (site owner's own photography, 16 July 2026), not yet confirmed for any other project.
- [x] approved brief, constraints, interventions, and outcome — outcome confirmed for Marylebone Lobby 16 July 2026 (owner: site owner); other projects unconfirmed beyond what they already publish.
- [x] indexable, teaser/noindex, draft, private, or remove treatment — confirmed by the 16 July 2026 inventory approval above; implemented per P1.10.
- [x] whether it qualifies as a launch case study — resolved by the case-study launch threshold decision: Marylebone Lobby alone, see `docs/overhaul/DECISIONS.md`.

## Current launch constraint — resolved

**Resolved (16 July 2026, owner: site owner).** The site owner explicitly approved a smaller portfolio led by Marylebone Lobby rather than waiting for more case studies — see the case-study launch threshold decision in `docs/overhaul/DECISIONS.md`. The original constraint (do not complete the homepage/Work hierarchy around the present five coming-soon projects without one of the two approvals below) is satisfied by that decision. Kept here for the historical record of what the constraint was and how it was closed.

## Case-study model gaps (P3.4, 16 July 2026)

Building out the case-study content model against Marylebone Lobby (the one published project) surfaced two specific follow-ups from the row above, now backed by real schema capability rather than a general note — both resolved for this project on 16 July 2026:

- **Outcome wording.** The template's `extraSections` already supports an arbitrary heading/text block. The site owner confirmed the outcome — a redesigned lobby that gives residents a warmer welcome on arrival and gives guests a proper waiting area — now published as an "Outcome" section.
- **Image type (photography vs. visualisation).** `admin/config.yml` exposes an optional `imageType` field per gallery image (and a matching optional `caption` field). The site owner confirmed both of Marylebone Lobby's gallery images are their own photography; `imageType: Photography` is now set on both.

Both were content/business decisions, not implementation gaps, and still are for every other project — do not fill either in for another project without that project's own owner sign-off.
