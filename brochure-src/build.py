"""Build the Apartment 5 brochure.
Usage:  python3 build.py
Needs:  pip install playwright pillow && python3 -m playwright install chromium
Output: out/98pp/   (upload this folder to the website as /98pp/)
        out/98PP Brochure.pdf   (email/screen version, 192 dpi)
        out/98PP Brochure - Print.pdf   (print version, A4 at 300 dpi)
"""
import asyncio, os, pathlib, shutil, re
from playwright.async_api import async_playwright
from PIL import Image
HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'out'; WEB = OUT / '98pp'; RAW = OUT / 'raw'; RAW_PRINT = OUT / 'raw-print'
# Pages are 1123 x 794 CSS px (A4 landscape at 96 px/in). Web pages and the
# screen PDF render at 2x (192 dpi). The print PDF renders at 300/96 = 3.125x,
# which makes each page 3509 x 2481 px: A4 (297 x 210 mm) at 300 dpi.
WEB_SCALE = 2
PRINT_DPI = 300
PRINT_SCALE = PRINT_DPI / 96

async def render(scale, dest):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None)
        pg = await b.new_page(viewport={'width': 1123, 'height': 794}, device_scale_factor=scale)
        await pg.goto((HERE / 'brochure.html').as_uri()); await pg.wait_for_timeout(1500)
        ids = await pg.eval_on_selector_all('.page', 'els => els.map(e => e.id)')
        for i, pid in enumerate(ids, 1):
            await pg.locator('#' + pid).screenshot(path=str(dest / f'p{i}.png'))
        await b.close()
        return len(ids)

def main():
    shutil.rmtree(OUT, ignore_errors=True); (WEB / 'pages').mkdir(parents=True); RAW.mkdir(); RAW_PRINT.mkdir()
    n = asyncio.run(render(WEB_SCALE, RAW))
    imgs = []
    for i in range(1, n + 1):
        im = Image.open(RAW / f'p{i}.png').convert('RGB'); imgs.append(im)
        im.resize((1600, 1131), Image.LANCZOS).save(WEB / 'pages' / f'p{i}.jpg', quality=84)
    imgs[0].save(OUT / '98PP Brochure.pdf', save_all=True, append_images=imgs[1:], resolution=96 * WEB_SCALE)
    # Print PDF: a separate high-resolution render, used for this file only.
    asyncio.run(render(PRINT_SCALE, RAW_PRINT))
    prints = [Image.open(RAW_PRINT / f'p{i}.png').convert('RGB') for i in range(1, n + 1)]
    prints[0].save(OUT / '98PP Brochure - Print.pdf', save_all=True, append_images=prints[1:],
                   resolution=PRINT_DPI, quality=95)
    # viewer: one <div class="page"> per page image
    tpl = (HERE / 'viewer' / 'index.template.html').read_text()
    pages = '\n'.join(f'<div class="page"><img src="pages/p{i}.jpg" alt="Page {i}"></div>' for i in range(1, n + 1))
    html = re.sub(r'(<div id="book">).*?(</div></template>)', lambda m: m.group(1) + '\n' + pages + '\n' + m.group(2), tpl, flags=re.S)
    (WEB / 'index.html').write_text(html)
    shutil.copy(HERE / 'viewer' / 'page-flip.js', WEB)
    shutil.rmtree(RAW); shutil.rmtree(RAW_PRINT)
    print(f'Built {n} pages -> {WEB}, {OUT / "98PP Brochure.pdf"} and {OUT / "98PP Brochure - Print.pdf"}')

if __name__ == '__main__':
    main()
