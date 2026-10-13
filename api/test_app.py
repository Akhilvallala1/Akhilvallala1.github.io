import pytest
from fastapi.testclient import TestClient

import app as svc

ORIGIN = "https://akhilvallala1.github.io"


@pytest.fixture
def client(monkeypatch):
    calls = []

    def fake(q):
        calls.append(q)
        if "weather" in q or "poem" in q:
            return {"on_topic": False, "answer": "sunny"}
        return {"on_topic": True, "answer": "He has shipped LLM systems in production at Blocsmith — since 2025."}

    monkeypatch.setattr(svc, "answer_fn", fake)
    monkeypatch.setattr(svc, "limits", svc.Limits(per_min=3, per_day=5, daily_cap=100))
    monkeypatch.setattr(svc, "cache", svc.AnswerCache())
    with TestClient(svc.app) as c:
        c.calls = calls
        yield c


def test_on_topic_answer_without_em_dash(client):
    r = client.post("/ask", json={"question": "Has he shipped LLMs?"}).json()
    assert r["on_topic"] and "Blocsmith" in r["answer"] and "—" not in r["answer"]


def test_off_topic_never_returns_model_text(client):
    r = client.post("/ask", json={"question": "What's the weather in Paris?"}).json()
    assert not r["on_topic"] and r["answer"] == svc.OFF_TOPIC and "sunny" not in r["answer"]


def test_cache_serves_repeats_without_a_model_call(client):
    client.post("/ask", json={"question": "Has he shipped LLMs?"})
    r = client.post("/ask", json={"question": "  has he SHIPPED llms  "}).json()
    assert r["cached"] and len(client.calls) == 1


def test_per_minute_limit(client):
    codes = [client.post("/ask", json={"question": f"question {i} about Akhil"},
                         headers={"x-forwarded-for": "1.1.1.1"}).status_code for i in range(4)]
    assert codes == [200, 200, 200, 429]


def test_daily_cap_rests_politely(monkeypatch, client):
    monkeypatch.setattr(svc, "limits", svc.Limits(per_min=50, per_day=50, daily_cap=2))
    for i in range(2):
        client.post("/ask", json={"question": f"q{i} about him"})
    r = client.post("/ask", json={"question": "one more about him"}).json()
    assert r["answer"] == svc.RESTING


def test_length_cap(client):
    assert client.post("/ask", json={"question": "a" * 301}).status_code == 422


def test_cors_only_for_the_site(client):
    ok = client.options("/ask", headers={"Origin": ORIGIN, "Access-Control-Request-Method": "POST"})
    assert ok.headers.get("access-control-allow-origin") == ORIGIN
    bad = client.options("/ask", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in bad.headers


def test_model_failure_is_a_clean_502(monkeypatch, client):
    def boom(q):
        raise RuntimeError("quota")
    monkeypatch.setattr(svc, "answer_fn", boom)
    assert client.post("/ask", json={"question": "anything about him"}).status_code == 502
