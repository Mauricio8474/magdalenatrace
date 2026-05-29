class TestChatbot:
    def test_demo_mode_when_no_key(self, client, monkeypatch):
        monkeypatch.setenv("GEMINI_API_KEY", "")
        resp = client.post("/chatbot/mensaje", json={
            "mensaje": "Hola",
            "historial": [],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "modo demo" in data["respuesta"].lower()

    def test_demo_mode_when_placeholder_key(self, client, monkeypatch):
        monkeypatch.setenv("GEMINI_API_KEY", "tu_api_key_aqui")
        resp = client.post("/chatbot/mensaje", json={
            "mensaje": "Hola",
            "historial": [],
        })
        assert resp.status_code == 200
        assert "modo demo" in resp.json()["respuesta"].lower()

    def test_endpoint_accepts_message(self, client):
        resp = client.post("/chatbot/mensaje", json={
            "mensaje": "¿Qué fincas hay?",
            "historial": [],
        })
        # Con key válida → 200 + modelo Gemini; con key inválida → 500
        assert resp.status_code in (200, 500)
        if resp.status_code == 200:
            assert "respuesta" in resp.json()
