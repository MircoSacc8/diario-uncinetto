"""Disegna l'icona dell'app (un gomitolo) nelle misure richieste da iPhone e Android.
Uso: python3 strumenti/crea-icone.py  → scrive i PNG in assets/icone/"""
from PIL import Image, ImageDraw
import math, os

SFONDO = (168, 103, 107)     # rosa antico, come --accent
GOMITOLO = (246, 239, 231)   # beige, come --bg
FILO = (168, 103, 107)
SCALA = 4                    # disegno grande e poi riduco, per bordi lisci

def disegna(lato):
    L = lato * SCALA
    img = Image.new("RGB", (L, L), SFONDO)
    d = ImageDraw.Draw(img)
    cx, cy, r = L * 0.5, L * 0.52, L * 0.30
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GOMITOLO)
    w = max(2, int(L * 0.022))
    # fili curvi dentro il gomitolo (archi di cerchi più grandi, ritagliati)
    maschera = Image.new("L", (L, L), 0)
    ImageDraw.Draw(maschera).ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    fili = Image.new("RGBA", (L, L), (0, 0, 0, 0))
    df = ImageDraw.Draw(fili)
    for k in (-0.55, -0.15, 0.25, 0.65):
        R = r * 1.25
        ox, oy = cx + r * 1.05, cy + k * r * 1.4
        df.ellipse([ox - R - r, oy - R, ox + R - r, oy + R], outline=FILO + (255,), width=w)
    for k in (-0.4, 0.2):
        R = r * 0.95
        ox, oy = cx - r * 0.2 + k * r, cy - r * 1.05
        df.ellipse([ox - R, oy - R + r * 0.2, ox + R, oy + R + r * 0.2], outline=FILO + (255,), width=w)
    img.paste(fili, (0, 0), Image.composite(fili.split()[3], Image.new("L", (L, L), 0), maschera))
    # bordo del gomitolo e filo che esce in basso a destra
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=FILO, width=w)
    pts = []
    for i in range(41):
        t = i / 40
        x = cx + r * 0.55 + t * r * 1.05
        y = cy + r * 0.78 + math.sin(t * math.pi * 1.6) * r * 0.18 + t * r * 0.35
        pts.append((x, y))
    d.line(pts, fill=GOMITOLO, width=int(w * 1.4), joint="curve")
    return img.resize((lato, lato), Image.LANCZOS)

cartella = os.path.join(os.path.dirname(__file__), "..", "assets", "icone")
for lato, nome in ((180, "apple-touch-icon.png"), (192, "icona-192.png"), (512, "icona-512.png")):
    disegna(lato).save(os.path.join(cartella, nome), optimize=True)
print("ok")
