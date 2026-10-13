FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8080
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py profile.md ./
RUN useradd --create-home --uid 10001 api
USER api
CMD exec uvicorn app:app --host 0.0.0.0 --port ${PORT} --no-access-log --workers 1
