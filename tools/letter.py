"""
Maakt de ingebakken Fredoka voor "Tijd is Om" en schrijft hem als base64
terug in de @font-face van index.html.

    npm pack @fontsource-variable/fredoka@5.3.0
    tar xzf fontsource-variable-fredoka-5.3.0.tgz
    pip install fonttools brotli
    python3 tools/letter.py package/files/fredoka-latin-wght-normal.woff2

Wat het doet, en waarom (zie docs/ontwerp.md, "Eén letter voor cijfers en
koppen"):

- de variabele letter vastzetten op gewicht 700: één stand is 14 KB, de
  hele as zou het dubbele zijn en de app gebruikt maar één dikte;
- de cijfers allemaal even breed maken, het glyph gecentreerd in het
  bredere vak. Fredoka heeft geen tnum, en zonder dat springt de klok bij
  elke tel en de eindstand bij het optellen;
- alleen Latijn houden (ASCII, Latin-1 en een paar leestekens).

Deterministisch: dezelfde invoer geeft dezelfde base64.
"""
import base64, io, re, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

BRON = sys.argv[1]
HTML = 'index.html'
TEKENS = 'U+0020-007E,U+00A0-00FF,U+2212,U+2013,U+2014,U+2026,U+00B7'

f = instancer.instantiateVariableFont(TTFont(BRON), {'wght': 700})

cmap = f.getBestCmap(); glyf = f['glyf']; hmtx = f['hmtx']
cijfers = [cmap[ord(c)] for c in '0123456789']
breed = max(hmtx[n][0] for n in cijfers)
for n in cijfers:
    adv, _ = hmtx[n]
    dx = (breed - adv) // 2
    g = glyf[n]
    if g.isComposite():
        for c in g.components:
            c.x += dx
    else:
        g.coordinates.translate((dx, 0))
    g.recalcBounds(glyf)
    hmtx[n] = (breed, g.xMin)

f.recalcTimestamp = False
tmp = io.BytesIO(); f.save(tmp); tmp.seek(0)
f = TTFont(tmp, recalcTimestamp=False)
opt = subset.Options()
opt.flavor = 'woff2'
opt.layout_features = ['kern', 'liga']
s = subset.Subsetter(opt)
s.populate(unicodes=subset.parse_unicodes(TEKENS))
s.subset(f)
uit = io.BytesIO(); f.flavor = 'woff2'; f.save(uit)  # de tijdstempel blijft die van de bron
b64 = base64.b64encode(uit.getvalue()).decode()

html = open(HTML, encoding='utf-8').read()
html, n = re.subn(r'(font-family: "Fredoka";\n  src: url\(data:font/woff2;base64,)[A-Za-z0-9+/=]+',
                  lambda m: m.group(1) + b64, html)
assert n == 1, 'de @font-face van Fredoka niet gevonden'
open(HTML, 'w', encoding='utf-8').write(html)
print(f'Fredoka 700: {len(uit.getvalue())} bytes, cijfers {breed} breed')
