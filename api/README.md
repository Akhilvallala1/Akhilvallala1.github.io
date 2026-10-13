# Portfolio assistant API

Answers recruiters' questions about Akhil, and nothing else. Powers the "Ask about Akhil" box on
the site.

- **No retrieval.** The whole profile (`profile.md`, about 1.5k tokens) goes in every prompt. At this
  size that's more accurate than chunked retrieval.
- **Model:** Gemini 2.5 Flash-Lite on Vertex AI, called with the service's own Google identity, so
  there is no API key to manage. About $0.0002 per question.
- **Scope lock:** the model returns `{on_topic, answer}` as structured JSON. Off-topic questions get a
  fixed refusal and the model's text is never shown.
- **Abuse limits:** 300-character questions, 5 per minute and 30 per day per visitor, 500 per day for
  the whole site, 300-token answers, repeated questions served from cache at no cost.
- **Privacy:** no access logs. Questions are kept only in the in-memory answer cache, for up to 24h.

## Endpoints

```
POST /ask      {"question": "..."}  ->  {"answer": "...", "on_topic": true, "cached": false}
GET  /health
```

## Deploy (Cloud Shell)

```
gcloud services enable aiplatform.googleapis.com
gcloud run deploy portfolio-api --source api --region us-east1 --allow-unauthenticated \
  --memory 512Mi --min-instances 0 --max-instances 2 --cpu-boost \
  --set-env-vars ALLOWED_ORIGINS=https://akhilvallala1.github.io
```

The Cloud Run runtime service account needs `roles/aiplatform.user`.

## Test

```
pip install fastapi uvicorn google-genai pytest httpx && pytest api/test_app.py
```
