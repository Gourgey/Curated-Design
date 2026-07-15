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
