# Shared design tokens

Implemented: 15 July 2026  
Build-plan ticket: P2.1 — Establish design tokens

The token layer at the top of `assets/css/styles.css` is the source of truth for shared colour, typography, spacing, layout, geometry, layer, and motion decisions. New work should use these semantic tokens instead of adding page-prefixed values or repeating literals.

## Colour

| Role | Token | Current value |
| --- | --- | --- |
| Dark canvas | `--color-canvas-dark` | `#0e0e0e` |
| Dark surface | `--color-surface-dark` | `#16181f` |
| Light canvas | `--color-canvas-light` | `#f2eee6` |
| Light surface | `--color-surface-light` | `#faf8f4` |
| Muted/project surface | `--color-surface-muted` | `#e4e1d7` |
| Inverse surface | `--color-surface-inverse` | `#14130f` |
| Text on dark | `--color-text-on-dark` | `#f2f2f2` |
| Primary text | `--color-text-primary` | `#1b1a17` |
| Secondary text | `--color-text-secondary` | `#46443e` |
| Muted text | `--color-text-muted` | `#625e57` |
| Inverse text | `--color-text-inverse` | `#ede8dd` |
| Border | `--color-border` | `#c9c3b6` |
| Soft border | `--color-border-soft` | `#e4dfd4` |
| Accent | `--color-accent` | `#d1f365` |
| Muted accent | `--color-accent-muted` | `#cfe465` |
| Error state | `--color-state-error` | `#8f1d1d` |

The muted text token is the corrected WCAG-AA-safe replacement introduced during Phase 1. State colours must not be the only way a state is communicated.

## Typography

- Families: `--font-family-display` and `--font-family-body`.
- Sizes: `--font-size-kicker`, `--font-size-label`, `--font-size-body-small`, `--font-size-body`, and `--font-size-lead`.
- Weights: `--font-weight-light`, `--font-weight-regular`, and `--font-weight-medium`.
- Line heights: `--line-height-tight`, `--line-height-body`, and `--line-height-relaxed`.
- Tracking: `--letter-spacing-tight`, `--letter-spacing-label`, and `--letter-spacing-kicker`.

Display sizes remain fluid component decisions for now. Add a shared size only when it is used by more than one component; do not turn every existing number into a token.

## Spacing and layout

The spacing scale runs from `--space-3xs` (4px) to `--space-8xl` (144px). Shared layout roles are:

| Role | Token | Current value |
| --- | --- | --- |
| Wide content | `--layout-content-wide` | `1280px` |
| Standard content | `--layout-content-standard` | `1180px` |
| Reading measure | `--layout-reading-width` | `68ch` |
| Desktop page gutter | `--layout-page-gutter` | `80px` |
| Standard grid gap | `--layout-grid-gap` | `32px` |
| Minimum control target | `--control-target-min` | `44px` |

Radii, borders, shadows, and layers use the `--radius-*`, `--border-*`, `--shadow-*`, and `--layer-*` groups. Motion uses `--motion-duration-*` and `--motion-easing-*`.

## Responsive breakpoints

| Name | Width | Intended use |
| --- | ---: | --- |
| Compact | 640px | Small-phone component adjustments |
| Narrow | 760px | Single-column editorial layouts |
| Content stack | 920px | Multi-column content reflow |
| Wide | 1180px | Large-heading and gutter adjustments |
| Navigation | 1280px | Overlay-menu switch |

The matching `--breakpoint-*` custom properties are documentation/reference values only: CSS custom properties cannot be interpolated into media-query conditions. Media queries must use the documented literal. Older 700/820/900/901/980/1000/1001/1120 variants remain until P2.2 determines whether each represents a real component need or can move to this shared set.

## Migration and usage

The current `--sp-*`, `--cp-*`, `--hp-*`, `--pp-*`, and `--srv-*` variables are compatibility aliases. Their values now resolve to the shared tokens, keeping the current pages visually stable while P2.2 reorganises the stylesheet. Do not add new page-prefixed tokens.

Use semantic roles directly in new CSS:

```css
.example-card {
    padding: var(--space-md);
    border: var(--border-width-hairline) solid var(--color-border-soft);
    background: var(--color-surface-light);
    color: var(--color-text-primary);
    transition: transform var(--motion-duration-standard) var(--motion-easing-emphasized);
}
```

When a value does not express a repeatable design decision, keep it local. When the same role appears across components, promote it to a semantic token and document it here.
