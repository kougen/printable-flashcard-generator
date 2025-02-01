LABEL org.opencontainers.image.source=https://github.com/kougen/printable-flashcard-generator

FROM python:3.12

WORKDIR /app

COPY requirements.txt requirements.txt
COPY main.py main.py

COPY templates templates
COPY static static

RUN pip install -r requirements.txt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5501"]