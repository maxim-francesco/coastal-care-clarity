import os
from PIL import Image

tools_dir = os.path.dirname(os.path.abspath(__file__))
root = os.path.abspath(os.path.join(tools_dir, ".."))

raw_2x = os.path.join(root, "_tools", "raw-2x.png")
public_jpg = os.path.join(root, "public", "og-image.jpg")
full_png = os.path.join(root, "_screens", "og", "og-image-full.png")
thumb_png = os.path.join(root, "_screens", "og", "og-image-thumbnail.png")

os.makedirs(os.path.join(root, "_screens", "og"), exist_ok=True)

if not os.path.exists(raw_2x):
    print(f"Error: Raw screenshot file not found at {raw_2x}. Run render-og-cdp.mjs first.")
    exit(1)

img = Image.open(raw_2x)
print(f"Loaded raw image size: {img.size}")

# Downscale 2x screenshot to 1200x630 with Lanczos
img_1200 = img.resize((1200, 630), Image.Resampling.LANCZOS)
img_1200.save(full_png, "PNG")

# Convert to RGB and save JPEG quality 85
img_rgb = img_1200.convert("RGB")
img_rgb.save(public_jpg, "JPEG", quality=85, optimize=True)

# Downscale to 400x210 thumbnail
img_400 = img_1200.resize((400, 210), Image.Resampling.LANCZOS)
img_400.save(thumb_png, "PNG")

# Clean temp raw image
if os.path.exists(raw_2x):
    os.remove(raw_2x)

# Report file details
print("Processing complete!")
for path_file, label in [(public_jpg, "public/og-image.jpg"), (full_png, "_screens/og/og-image-full.png"), (thumb_png, "_screens/og/og-image-thumbnail.png")]:
    size = os.path.getsize(path_file)
    im = Image.open(path_file)
    print(f"{label}: dimensions={im.size[0]}x{im.size[1]}, size={size} bytes ({size/1024:.1f} KB)")
