#!/usr/bin/env python3
"""Designed read-card images (Phase 2b) for Spanish Level 1 scenes.

Crisp rendered text cards (menu, signs, wifi card), never photos, so
every word is controlled. Output: public/static/lesson-NNN/images/
read-u{unit}.jpg matching the curriculum's readCard imageUrls.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CARDS = {
    1: ("PARQUE INFANTIL", ["Abierto todos los días", "9:00 – 18:00"]),
    2: ("NOTA", ["Hay pan y agua", "La leche es para Ana"]),
    3: ("AUTOBÚS 10", ["Al centro", "Cada 20 minutos"]),
    4: ("MENÚ", ["Agua .......... 10", "Pan .......... 15", "Café .......... 20"]),
    5: ("MERCADO", ["Manzanas", "20 pesos el kilo"]),
    6: ("ESTACIÓN", ["Trenes al centro", "Andén 2"]),
    7: ("TAXI", ["Al aeropuerto", "30 minutos"]),
    8: ("EMBARQUE", ["Puerta 12", "9:30"]),
    9: ("VISA", ["Vacaciones", "1 semana"]),
    10: ("ANDÉN 2", ["Tren al centro", "Sale 10:00"]),
    11: ("WIFI", ["Clave: hotel123", "Desayuno: 7:00"]),
    12: ("HABITACIÓN 25", ["Aire acondicionado", "Baño"]),
    13: ("FARMACIA", ["Dolor de cabeza", "2 veces al día"]),
    14: ("HOTEL", ["Cuenta", "Total: 500 pesos"]),
    15: ("PARQUE", ["Fútbol", "10:00"]),
    16: ("COLEGIO", ["Hoy: dibujo", "Un caballo"]),
    17: ("OBJETOS PERDIDOS", ["Estación", "Una bolsa"]),
    18: ("COLEGIO", ["Ana escribió", "Un cuento"]),
    19: ("FIESTA", ["Sábado", "5:00"]),
    20: ("AUTOBÚS", ["Cada 15 minutos", "Al centro"]),
    21: ("PLAYA", ["Nadar", "Todos los días"]),
    22: ("DOCTOR", ["Hoy: descanso", "Arroz"]),
    23: ("CINE", ["Sábado", "7:00"]),
    24: ("CINE", ["Perros", "5:00"]),
}

def font(size, bold=False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    for base in ("/usr/share/fonts", "/usr/share/fonts/truetype/dejavu"):
        p = Path(base) / name
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.truetype(name, size)

for unit, (title, rows) in CARDS.items():
    img = Image.new("RGB", (800, 560), "#FDFDF8")
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([16, 16, 784, 544], radius=28, outline="#0E1B3D", width=6)
    d.rectangle([16, 16, 784, 130], fill="#1247B8")
    d.rounded_rectangle([16, 16, 784, 130], radius=28, fill="#1247B8")
    d.rectangle([16, 90, 784, 130], fill="#1247B8")
    tf = font(52, bold=True)
    tw = d.textlength(title, font=tf)
    d.text(((800 - tw) / 2, 38), title, font=tf, fill="white")
    y = 180
    for row in rows:
        rf = font(44)
        rw = d.textlength(row, font=rf)
        d.text(((800 - rw) / 2, y), row, font=rf, fill="#0E1B3D")
        y += 84
    prefix = f"{(unit - 1) * 4 + 1:03d}"
    out = ROOT / f"public/static/lesson-{prefix}/images/read-u{unit}.jpg"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, quality=90)
    print(out)
print("done")
