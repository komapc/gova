#!/usr/bin/env python3
"""Generate a 1024x500 Google Play feature graphic for Gova."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1024, 500
BLUE = (37, 99, 235)      # #2563EB brand
BLUE_DK = (23, 60, 150)
WHITE = (255, 255, 255)
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# vertical gradient background
img = Image.new("RGB", (W, H), BLUE)
d = ImageDraw.Draw(img)
for y in range(H):
    t = y / H
    r = int(BLUE[0] * (1 - t) + BLUE_DK[0] * t)
    g = int(BLUE[1] * (1 - t) + BLUE_DK[1] * t)
    b = int(BLUE[2] * (1 - t) + BLUE_DK[2] * t)
    d.line([(0, y), (W, y)], fill=(r, g, b))

# icon on the left (with a soft white rounded panel behind it)
icon = Image.open("icons/icon-512.png").convert("RGBA")
icon = icon.resize((300, 300), Image.LANCZOS)
ix, iy = 90, (H - 300) // 2
img.paste(icon, (ix, iy), icon)

# text block on the right
tx = 470
title_font = ImageFont.truetype(FONT_B, 130)
sub_font = ImageFont.truetype(FONT_R, 44)
tag_font = ImageFont.truetype(FONT_R, 30)

d.text((tx, 150), "Gova", font=title_font, fill=WHITE)
d.text((tx + 4, 300), "Altimetro", font=sub_font, fill=WHITE)
d.text((tx + 4, 355), "Preciza alteco en Esperanto", font=tag_font,
       fill=(225, 232, 250))

img.save("docs/play-assets/feature-graphic-1024x500.png")
print("wrote docs/play-assets/feature-graphic-1024x500.png", img.size)
