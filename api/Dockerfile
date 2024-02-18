FROM python:3.10

WORKDIR /app

COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY src/*.py src/

WORKDIR /app/src

ENV TZ Europe/Berlin
EXPOSE 8000

CMD [ "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000" ]
