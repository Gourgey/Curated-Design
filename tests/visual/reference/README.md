# Visual references

These screenshots preserve the pre-foundation visual state at overhaul milestone commit `70417d0`. They cover the homepage, Work, Studio, Contact, a published project, a service, the open navigation, and contact error/success states.

Regenerate them at 390px, 768px, and 1440px with:

```sh
npm run capture:references
```

The capture uses reduced-motion mode and a 1× device scale for deterministic output. Navigation-open references are viewport captures at the two overlay-menu widths; page and form-state references are full-page captures.

During a CSS refactor, render the current generated HTML with a stylesheet from a Git revision into a temporary directory:

```sh
node tools/capture-references.js \
  --output=/private/tmp/curated-pre-refactor \
  --stylesheet-git-ref=HEAD
```

This comparison mode does not modify the stored references or the working tree.

## Verifying responsive breakpoints

The default 390/768/1440px set only proves a page looks right at those three widths — it cannot catch a regression that only appears between them (for example, a two-column layout that briefly looks broken between 900px and 980px). Override the capture widths with `--widths=` (comma-separated) to check specific breakpoints directly, combined with `--output=` and `--only=` so the sweep stays fast:

```sh
node tools/capture-references.js \
  --output=/private/tmp/curated-breakpoint-check \
  --only=contact \
  --widths=960,979,980,981,1000
```

Use this before changing (or consolidating) any `@media` width in `assets/css/styles.css` — capture just below, at, and just above the existing breakpoint, make the change, re-capture the same widths into a second directory, and diff. Do not change a breakpoint's numeric value based on the 390/768/1440 baseline alone; none of those widths land inside the 700–1200px range where most of this stylesheet's non-shared breakpoints actually operate.
