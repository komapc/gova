#!/usr/bin/env python3
"""Generate the 1200x630 Open Graph / Twitter preview image for Gova."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BLUE = (37, 99, 235)      # #2563EB brand
BLUE_DK = (23, 60, 150)
WHITE = (255, 255, 255)
SOFT = (225, 232, 250)
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

# icon on the left
icon = Image.open("icons/icon-512.png").convert("RGBA")
icon = icon.resize((340, 340), Image.LANCZOS)
ix, iy = 90, (H - 340) // 2
img.paste(icon, (ix, iy), icon)

# text block on the right
tx = 500
d.text((tx, 140), "Gova", font=ImageFont.truetype(FONT_B, 140), fill=WHITE)
d.text((tx + 6, 320), "GPS & barometric altimeter", font=ImageFont.truetype(FONT_R, 42), fill=WHITE)
tag = ImageFont.truetype(FONT_R, 30)
d.text((tx + 6, 390), "No ads · No tracking · Works offline", font=tag, fill=SOFT)
d.text((tx + 6, 440), "gova.lipu.dev", font=tag, fill=SOFT)

img.save("icons/og-image.png", optimize=True)
print("wrote icons/og-image.png", img.size)
