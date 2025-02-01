import os

from fastapi import FastAPI, Request, Form, UploadFile, File
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from typing import List
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import io
import uvicorn
from dotenv import load_dotenv

load_dotenv()

templates = Jinja2Templates(directory="templates")
app = FastAPI()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
STATIC_DIR = Path("static/js")
STATIC_DIR.mkdir(exist_ok=True, parents=True)

SERVER_URL = os.getenv("SERVER_URL", "http://localhost:8000")


@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/add-row", response_class=HTMLResponse)
async def add_row(request: Request):
    return templates.TemplateResponse("row.html", {"request": request})


@app.post("/generate-pdf", response_class=HTMLResponse)
async def generate_pdf(
        request: Request,
        images: List[UploadFile] = File(...),
        words: List[str] = Form(...)
):
    num_cards = len(words)
    grid_size = (3, 5)
    card_size = (300, 200)

    pdf_size = (grid_size[0] * card_size[0], grid_size[1] * card_size[1])
    pdf_images = []
    pdf_words = []

    for i in range(num_cards):
        img = Image.open(io.BytesIO(await images[i].read()))
        img.thumbnail(card_size)  # Keep aspect ratio
        pdf_images.append(img)
        pdf_words.append(words[i])

    pdf_path = UPLOAD_DIR / "flashcards.pdf"
    pdf = Image.new("RGB", pdf_size, "white")
    draw = ImageDraw.Draw(pdf)
    font = ImageFont.load_default()

    for i, img in enumerate(pdf_images):
        x = (i % grid_size[0]) * card_size[0]
        y = (i // grid_size[0]) * card_size[1]
        img_x = x + (card_size[0] - img.width) // 2
        img_y = y + (card_size[1] - img.height) // 2
        pdf.paste(img, (img_x, img_y))
        draw.rectangle([x, y, x + card_size[0], y + card_size[1]], outline="black", width=2)  # Draw border

    pdf.save(pdf_path, "PDF")

    pdf_words_path = UPLOAD_DIR / "flashcards_words.pdf"
    word_pdf = Image.new("RGB", pdf_size, "white")
    draw = ImageDraw.Draw(word_pdf)

    for i, word in enumerate(pdf_words):
        x = (i % grid_size[0]) * card_size[0] + card_size[0] // 2
        y = (i // grid_size[0]) * card_size[1] + card_size[1] // 2
        draw.text((x, y), word, fill="black", anchor="mm", font=font)
        draw.rectangle([
            (i % grid_size[0]) * card_size[0],
            (i // grid_size[0]) * card_size[1],
            (i % grid_size[0]) * card_size[0] + card_size[0],
            (i // grid_size[0]) * card_size[1] + card_size[1]
        ], outline="black", width=2)  # Draw border for words

    word_pdf.save(pdf_words_path, "PDF")

    return templates.TemplateResponse("pdf_link.html", {
        "request": request,
        "pdf_url": f"/uploads/flashcards.pdf",
        "pdf_words_url": f"/uploads/flashcards_words.pdf"
    })


@app.get("/uploads/{file_name}")
async def get_upload(file_name: str):
    return FileResponse(UPLOAD_DIR / file_name)


def main():
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
