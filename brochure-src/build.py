"""Build the Apartment 5 brochure.
Usage:  python3 build.py
Needs:  pip install playwright pillow && python3 -m playwright install chromium
Output: out/98pp/   (upload this folder to the website as /98pp/)
        out/98PP Brochure.pdf   (print/email version)
"""
import asyncio, os, pathlib, shutil, re
from playwright.async_api import async_playwright
from PIL import Image
HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'out'; WEB = OUT / '98pp'; RAW = OUT / 'raw'

async def render():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None)
        pg = await b.new_page(viewport={'width': 1123, 'height': 794}, device_scale_factor=2)
        await pg.goto((HERE / 'brochure.html').as_uri()); await pg.wait_for_timeout(1500)
        ids = await pg.eval_on_selector_all('.page', 'els => els.map(e => e.id)')
        for i, pid in enumerate(ids, 1):
            await pg.locator('#' + pid).screenshot(path=str(RAW / f'p{i}.png'))
        await b.close()
        return len(ids)

def main():
    shutil.rmtree(OUT, ignore_errors=True); (WEB / 'pages').mkdir(parents=True); RAW.mkdir()
    n = asyncio.run(render())
    imgs = []
    for i in range(1, n + 1):
        im = Image.open(RAW / f'p{i}.png').convert('RGB'); imgs.append(im)
        im.resize((1600, 1131), Image.LANCZOS).save(WEB / 'pages' / f'p{i}.jpg', quality=84)
    imgs[0].save(OUT / '98PP Brochure.pdf', save_all=True, append_images=imgs[1:], resolution=192)
    # viewer: one <div class="page"> per page image
    tpl = (HERE / 'viewer' / 'index.template.html').read_text()
    pages = '\n'.join(f'<div class="page"><img src="pages/p{i}.jpg" alt="Page {i}"></div>' for i in range(1, n + 1))
    html = re.sub(r'(<div id="book">).*?(</div></template>)', lambda m: m.group(1) + '\n' + pages + '\n' + m.group(2), tpl, flags=re.S)
    (WEB / 'index.html').write_text(html)
    shutil.copy(HERE / 'viewer' / 'page-flip.js', WEB)
    shutil.rmtree(RAW)
    print(f'Built {n} pages -> {WEB} and {OUT / "98PP Brochure.pdf"}')

if __name__ == '__main__':
    main()
