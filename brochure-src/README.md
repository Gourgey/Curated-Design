# The Byron Penthouse, 98 Portland Place – brochure source

This folder builds the page-turning brochure at curateddesign.studio/98pp/ and a matching PDF.

## What's here
- `brochure.html` – the design. Each `<div class="page">` is one A4 landscape page (1123 x 794 px). Text, layout and image crops are all set here.
- `renders/` – the images used by the pages. Replace a file with the same name to update it everywhere it appears.
- `fonts/` – Cormorant Garamond (headings) and Jost (body).
- `viewer/` – the page-turning viewer (StPageFlip) that wraps the page images.
- `build.py` – exports every page to an image and assembles the web folder and PDF.

## Build
```
pip install playwright pillow
python3 -m playwright install chromium
python3 build.py
```
Output:
- `out/98pp/` – copy this over the website's `98pp/` folder (served as-is at /98pp/, keep the noindex tag).
- `out/98PP Brochure.pdf` – email/screen version (192 dpi).
- `out/98PP Brochure - Print.pdf` – print version, A4 landscape at 300 dpi.

## Editing tips
- Open `brochure.html` in a browser to preview all pages stacked.
- Image crops: adjust `background-position` (and `background-size` where set) on the `.ph` element.
- Add or remove a page by adding or deleting a `<div class="page" id="...">` block; the build picks up any number of pages. The viewer shows one full page per turn on every screen size, so any page count works.
- Palette: charcoal `#262320`, stone `#f3eee7`, bronze `#b08d57`.

## Pages
1 Cover (exterior) · 2 Living & dining (full-bleed) · 3 The residence · 4 Reception · 5 Living & dining · 6 Kitchen · 7 Principal bedroom · 8 Principal suite retreat · 9 Principal bathroom · 10 Study & guest en suite · 11 The outlook · 12 The Park Crescent Club · 13 Club: games room & gym · 14 Floor plan & EPC

Note: `renders/07-kitchen-marquetry.png` is the alternative straw-marquetry kitchen option. To use it, change `07-kitchen-bronze.png` to `07-kitchen-marquetry.png` on page 5 and update the kitchen text.
