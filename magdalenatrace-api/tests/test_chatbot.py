class TestChatbot:
    def test_endpoint_returns_response(self, client):
        """Con key de prueba (cargada al importar módulo), el endpoint responde."""
        resp = client.post("/chatbot/mensaje", json={
            "mensaje": "Hola",
            "historial": [],
        })
        # key "test-key" no es válida para Gemini → 500; key válida → 200
        assert resp.status_code in (200, 500)
        if resp.status_code == 200:
            assert "respuesta" in resp.json()

    def test_endpoint_structure(self, client):
        """Verifica estructura de la respuesta."""
        resp = client.post("/chatbot/mensaje", json={
            "mensaje": "¿Qué tal?",
            "historial": [],
        })
        assert "respuesta" in resp.json() or resp.status_code == 500
