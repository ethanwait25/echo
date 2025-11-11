from PIL import Image
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

path = "images/quiet_area.jpg"
with Image.open(path) as img:
    img.load()
    img = img.convert("RGB")

for angle in [0, 90, 180, 270]:
    img_rotated = img.rotate(angle, expand=True)
#     img_txt = pytesseract.image_to_string(img_rotated, lang="eng")
#     print(f"Text is: {img_txt}")

    raw = pytesseract.image_to_string(img_rotated, lang="eng", config="--psm 6 --oem 3")
    print("STRING:", repr(raw), "LEN:", len(raw))

    # Inspect tokens + confidence (helps distinguish “no text” vs. “low confidence”)
    data = pytesseract.image_to_data(img_rotated, lang="eng", config="--psm 6 --oem 3", output_type=pytesseract.Output.DICT)
    print("NUM BOXES:", len(data["text"]))
    hits = [(t, int(c)) for t, c in zip(data["text"], data["conf"]) if t.strip() and c != -1]
    print("HITS (text, conf):", hits[:10])