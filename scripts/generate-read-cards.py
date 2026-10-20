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
    25: ("ESTACIÓN", ["Sábado", "10:00"]),
    26: ("RESTAURANTE", ["Mesa para 4", "9:00"]),
    27: ("FIESTA", ["Viernes", "Mi cumpleaños"]),
    28: ("MAPA", ["Este verano", "La montaña"]),
    29: ("PARQUE", ["Pelota", "Bici"]),
    30: ("LIBRERÍA", ["Un regalo", "Este libro"]),
    31: ("CENTRO DE SALUD", ["Mañana", "5 de la tarde"]),
    32: ("COLEGIO", ["Mañana", "Música y deporte"]),
    33: ("PÍCNIC", ["Pan, queso y fruta", "Sándwiches"]),
    34: ("TREN A GUADALAJARA", ["3:15", "6:00"]),
    35: ("PLAYA", ["Nueva casa", "Cerca de la playa"]),
    36: ("AÑO NUEVO", ["Nadar", "Leer más"]),
    37: ("ACCIDENTE", ["Un ciclista", "Coche rojo"]),
    38: ("GATO", ["Pequeño", "Negro"]),
    39: ("CONCIERTO", ["Anoche", "Rock"]),
    40: ("TELÉFONO", ["8:00", "Cena"]),
    41: ("JARDÍN", ["Leo", "Un cachorro"]),
    42: ("SUEÑO", ["Un caballo", "El mar"]),
    43: ("CAMISA", ["Azul", "Más barata"]),
    44: ("MENÚ", ["Pescado", "Sin nueces"]),
    45: ("DIBUJO", ["Tom", "Fútbol"]),
    46: ("CINE", ["Perros", "Espacio"]),
    47: ("CLUB", ["Martes", "Jueves"]),
    48: ("HOTEL", ["Piscina", "Barato"]),
    49: ("NOTA", ["Dormir mejor", "Sin libro"]),
    50: ("DINERO", ["Un caballo", "Una granja"]),
    51: ("GATO", ["Este fin de semana", "La cocina"]),
    52: ("ZAPATOS", ["Rotos", "¿Dinero?"]),
    53: ("HABITACIÓN", ["Mañana", "10:00"]),
    54: ("CINE", ["Sábado", "Perdón"]),
    55: ("COLEGIO", ["9 años", "Nadar"]),
    56: ("ENCUESTA", ["Todos los días", "Pescado"]),
    57: ("BANCO", ["Dólares", "Pasaporte"]),
    58: ("CINE", ["Hoy", "¡Corre!"]),
    59: ("MUSEO", ["Recto", "Derecha"]),
    60: ("ADIÓS", ["Otra ciudad", "El mes que viene"]),
}

def font(size, bold=False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    for base in ("/usr/share/fonts", "/usr/share/fonts/truetype/dejavu"):
        p = Path(base) / name
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.truetype(name, size)

EN_CARDS = {
    1: ("PLAYGROUND", ["Open every day", "9:00 - 6:00"]),
    2: ("NOTE", ["Bread and water", "Milk is for Ana"]),
    3: ("BUS 10", ["To the centre", "Every 20 minutes"]),
    4: ("MENU", ["Water .......... 2", "Bread .......... 1", "Coffee .......... 3"]),
    5: ("MARKET", ["Apples", "2 euros a kilo"]),
    6: ("STATION", ["Trains to the centre", "Platform 2"]),
    7: ("TAXI", ["To the airport", "30 minutes"]),
    8: ("BOARDING", ["Gate 12", "9:30"]),
    9: ("VISA", ["Holidays", "1 week"]),
    10: ("PLATFORM 2", ["Train to the centre", "Leaves 10:00"]),
    11: ("WIFI", ["Password: hotel123", "Breakfast: 7:00"]),
    12: ("ROOM 25", ["Air conditioning", "Bathroom"]),
    13: ("PHARMACY", ["Headache", "Twice a day"]),
    14: ("HOTEL", ["Bill", "Total: 500"]),
    15: ("PARK", ["Football", "10:00"]),
    16: ("SCHOOL", ["Today: drawing", "A horse"]),
    17: ("LOST PROPERTY", ["Station", "One bag"]),
    18: ("SCHOOL", ["Ana wrote", "A story"]),
    19: ("PARTY", ["Cake", "Juice"]),
    20: ("BUS", ["Every 15 minutes", "To the centre"]),
    21: ("BEACH", ["Swimming", "Every day"]),
    22: ("KNEE", ["Sit down", "Water"]),
    23: ("DOCTOR", ["Today: rest", "Rice"]),
    24: ("CINEMA", ["Dogs", "5:00"]),
    25: ("BEACH", ["Saturday", "10:00"]),
    26: ("SOL", ["Tomorrow", "Table for 4"]),
    27: ("PARTY", ["Friday", "Cake"]),
    28: ("MAP", ["Mountains", "By car"]),
    29: ("SUN", ["Tomorrow", "Park"]),
    30: ("BOOKSHOP", ["Books", "Gifts"]),
    31: ("HEALTH CENTRE", ["Thursday", "7:00"]),
    32: ("SCHOOL", ["Music", "Sport"]),
    33: ("PICNIC", ["Bread", "Juice"]),
    34: ("MADRID", ["3:15", "6:00"]),
    35: ("BEACH HOUSE", ["Near the beach", "Bus to school"]),
    36: ("NEW YEAR", ["Swim", "Books"]),
    37: ("STREET", ["Cyclist", "Red car"]),
    38: ("CAT", ["Small", "Black"]),
    39: ("STAGE", ["Rock band", "Tonight"]),
    40: ("PHONE", ["8:00", "Missed call"]),
    41: ("GARDEN", ["Rain", "A puppy"]),
    42: ("DREAM", ["Sea", "A horse"]),
    43: ("SHIRTS", ["Blue", "Cheaper"]),
    44: ("MENU", ["Fish", "No nuts"]),
    45: ("DRAWING", ["Pencils", "Football"]),
    46: ("CINEMA", ["Dogs", "Space"]),
    47: ("CLUB", ["Swim", "Tue + Thu"]),
    48: ("HOTELS", ["Pool", "Cheaper"]),
    49: ("BED", ["9:00", "Sleep"]),
    50: ("MONEY", ["A horse", "A farm"]),
    51: ("CAT", ["Weekend", "Kitchen"]),
    52: ("SHOES", ["Broken", "Receipt"]),
    53: ("ROOM", ["Tomorrow", "10:00"]),
    54: ("CINEMA", ["Saturday", "Sorry"]),
    55: ("SCHOOL", ["9 years old", "Swim"]),
    56: ("FOOD", ["Every day", "Fish"]),
    57: ("BANK", ["Pounds", "Passport"]),
    58: ("CINEMA", ["Today", "Hurry!"]),
    59: ("MUSEUM", ["Straight on", "Right"]),
    60: ("CITY", ["Next month", "Call weekly"]),
}

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
for unit, (title, rows) in EN_CARDS.items():
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
    out = ROOT / f"public/static/lesson-{prefix}/images/read-u{unit}-en.jpg"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, quality=90)
    print(out)
print("done")
