import os

from fastapi import FastAPI, Request, Form, UploadFile, File
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from typing import List, Optional
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import io
import uvicorn
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

templates = Jinja2Templates(directory="templates")
app = FastAPI()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
STATIC_DIR = Path("static/js")
STATIC_DIR.mkdir(exist_ok=True, parents=True)

WORD_FILE_NAME = os.getenv("WORD_FILE_NAME", "flashcards_words.pdf")
IMAGE_FILE_NAME = os.getenv("IMAGE_FILE_NAME", "flashcards.pdf")

SERVER_URL = os.getenv("SERVER_URL", "http://localhost:8000")


def get_timestamp():
    return datetime.now().strftime("%Y%m%d%H%M%S")


def get_timestamped_filename(file_name: str):
    return f"{get_timestamp()}_{file_name}"


@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/add-row", response_class=HTMLResponse)
async def add_row(request: Request):
    return templates.TemplateResponse("row.html", {"request": request})


@app.get("/error", response_class=HTMLResponse)
async def error(request: Request, error_type: int | None = None):
    if error_type == 404:
        file_name = request.query_params.get("file_name")
        return templates.TemplateResponse("error/file_404.html",
                                          {"request": request, "file_name": file_name})

    error_message = request.query_params.get("error_message") or "An error occurred"
    return templates.TemplateResponse("error.html", {"request": request, "error_message": error_message})


@app.post("/generate-pdf", response_class=HTMLResponse)
async def generate_pdf(
        request: Request,
        words: List[str] = Form(...),
        images: Optional[List[UploadFile]] = Form(None),
        exclude_images: Optional[bool] = Form(False)
):
    num_cards = len(words)
    grid_size = (3, 5)
    card_size = (300, 200)

    pdf_size = (grid_size[0] * card_size[0], grid_size[1] * card_size[1])
    pdf_images = []
    pdf_words = []

    page_count = num_cards // (grid_size[0] * grid_size[1]) + 1

    for i in range(num_cards):
        if not exclude_images:
            img = Image.open(io.BytesIO(await images[i].read()))
            img.thumbnail(card_size)  # Keep aspect ratio
            pdf_images.append(img)
        pdf_words.append(words[i])

    font = ImageFont.truetype('./assets/Roboto-Medium.ttf', 30)

    pdf_words_path = UPLOAD_DIR / get_timestamped_filename(WORD_FILE_NAME)
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

    body = {
        "pdf_words_url": f"/uploads/{pdf_words_path.name}",
    }

    if not exclude_images:
        pdf_path = UPLOAD_DIR / get_timestamped_filename(IMAGE_FILE_NAME)
        pdf = Image.new("RGB", pdf_size, "white")
        draw = ImageDraw.Draw(pdf)

        for i, img in enumerate(pdf_images):
            x = (i % grid_size[0]) * card_size[0]
            y = (i // grid_size[0]) * card_size[1]
            img_x = x + (card_size[0] - img.width) // 2
            img_y = y + (card_size[1] - img.height) // 2
            pdf.paste(img, (img_x, img_y))
            draw.rectangle([x, y, x + card_size[0], y + card_size[1]], outline="black", width=2)  # Draw border

        pdf.save(pdf_path, "PDF")
        body["pdf_url"] = f"/uploads/{pdf_path.name}"

    body["request"] = request

    return templates.TemplateResponse("pdf_link.html", body)


@app.get("/uploads/{file_name}")
async def get_upload(request: Request, file_name: str):
    if not (UPLOAD_DIR / file_name).exists():
        return templates.TemplateResponse("index.html", {
            "request": request,
            "error_type": 404,
            "file_name": file_name
        })
    return FileResponse(UPLOAD_DIR / file_name)


@app.get("/static/js/{file_name}")
async def get_static(file_name: str):
    if not (STATIC_DIR / file_name).exists():
        return None

    return FileResponse(STATIC_DIR / file_name)


def main():
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
