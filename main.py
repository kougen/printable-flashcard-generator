import os

from fastapi import FastAPI, Request, Form, UploadFile
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from typing import List, Optional
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from PyPDF2 import PdfMerger
import io
import textwrap
import uvicorn
from dotenv import load_dotenv
from datetime import datetime

from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

load_dotenv()

WORD_FILE_NAME = os.getenv("WORD_FILE_NAME", "flashcards_words.pdf")
IMAGE_FILE_NAME = os.getenv("IMAGE_FILE_NAME", "flashcards.pdf")

SERVER_URL = os.getenv("SERVER_URL", "http://localhost:8000")
FORCE_HTTPS = os.getenv("FORCE_HTTPS", "false").lower() == "true"

TRUSTED_HOSTS = os.getenv("TRUSTED_HOSTS", "").split(",")

templates = Jinja2Templates(directory="templates")
app = FastAPI()

if FORCE_HTTPS:
    app.add_middleware(HTTPSRedirectMiddleware)

if TRUSTED_HOSTS and TRUSTED_HOSTS != [""]:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=TRUSTED_HOSTS)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
STATIC_DIR = Path("static/js")
STATIC_DIR.mkdir(exist_ok=True, parents=True)



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
    grid_size = (3, 5)
    card_size = (300, 200)
    page_size = (grid_size[0] * card_size[0], grid_size[1] * card_size[1])
    items_per_page = grid_size[0] * grid_size[1]

    font_path = './assets/Roboto-Medium.ttf'
    font_size = 30
    font = ImageFont.truetype(font_path, font_size)

    word_pdf_pages = []
    image_pdf_pages = []

    total_words = len(words)
    num_word_pages = (total_words + items_per_page - 1) // items_per_page

    for page in range(num_word_pages):
        pdf_path = UPLOAD_DIR / get_timestamped_filename(f"words_page_{page}.pdf")
        word_pdf_pages.append(pdf_path)

        page_img = Image.new("RGB", page_size, "white")
        draw = ImageDraw.Draw(page_img)

        for i in range(items_per_page):
            word_index = page * items_per_page + i
            if word_index >= total_words:
                break

            x = (i % grid_size[0]) * card_size[0]
            y = (i // grid_size[0]) * card_size[1]

            wrapped_text = textwrap.wrap(words[word_index], width=15)

            total_text_height = sum(draw.textbbox((0, 0), line, font=font)[3] for line in wrapped_text)
            text_y = y + (card_size[1] - total_text_height) // 2

            for line in wrapped_text:
                line_width = draw.textbbox((0, 0), line, font=font)[2]
                text_x = x + (card_size[0] - line_width) // 2
                draw.text((text_x, text_y), line, fill="black", font=font)
                text_y += font_size

            draw.rectangle([x, y, x + card_size[0], y + card_size[1]], outline="black", width=2)

        page_img.save(pdf_path, "PDF")

    final_word_pdf_path = UPLOAD_DIR / get_timestamped_filename("final_words.pdf")
    word_merger = PdfMerger()

    for pdf in word_pdf_pages:
        word_merger.append(str(pdf))

    word_merger.write(final_word_pdf_path)
    word_merger.close()

    for pdf in word_pdf_pages:
        pdf.unlink()

    body = {
        "pdf_words_url": f"/uploads/{final_word_pdf_path.name}",
    }

    if not exclude_images:
        total_images = len(images)
        num_image_pages = (total_images + items_per_page - 1) // items_per_page

        for page in range(num_image_pages):
            pdf_path = UPLOAD_DIR / get_timestamped_filename(f"images_page_{page}.pdf")
            image_pdf_pages.append(pdf_path)

            page_img = Image.new("RGB", page_size, "white")
            draw = ImageDraw.Draw(page_img)

            for i in range(items_per_page):
                image_index = page * items_per_page + i
                if image_index >= total_images:
                    break

                x = (i % grid_size[0]) * card_size[0]
                y = (i // grid_size[0]) * card_size[1]

                img = Image.open(io.BytesIO(await images[image_index].read()))
                img.thumbnail(card_size)
                img_x = x + (card_size[0] - img.width) // 2
                img_y = y + (card_size[1] - img.height) // 2
                page_img.paste(img, (img_x, img_y))

                draw.rectangle([x, y, x + card_size[0], y + card_size[1]], outline="black", width=2)

            page_img.save(pdf_path, "PDF")

        final_image_pdf_path = UPLOAD_DIR / get_timestamped_filename("final_images.pdf")
        image_merger = PdfMerger()

        for pdf in image_pdf_pages:
            image_merger.append(str(pdf))

        image_merger.write(final_image_pdf_path)
        image_merger.close()

        for pdf in image_pdf_pages:
            pdf.unlink()
        body["pdf_images_url"] = f"/uploads/{final_image_pdf_path.name}"

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
