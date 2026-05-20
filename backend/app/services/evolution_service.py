import requests
from app.core.config import settings

class EvolutionService:
    def __init__(self):
        self.base_url = settings.EVOLUTION_API_URL.rstrip("/")
        self.api_key = settings.EVOLUTION_API_KEY
        self.instance = settings.EVOLUTION_INSTANCE

    def send_whatsapp(self, phone, text):
        if not self.base_url or not self.instance:
            print("ERRO: Evolution API não configurada.")
            return False

        url = f"{self.base_url}/message/sendText/{self.instance}"
        headers = {
            "apikey": self.api_key,
            "Content-Type": "application/json"
        }
        
        # Garante formato internacional
        clean_phone = "".join(filter(str.isdigit, phone))
        if not clean_phone.startswith("55"):
            clean_phone = "55" + clean_phone
            
        payload = {
            "number": clean_phone,
            "options": {
                "delay": 1200,
                "presence": "composing",
                "linkPreview": False
            },
            "textMessage": {
                "text": text
            }
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=20)
            if response.status_code not in [200, 201]:
                print(f"Erro Evolution API [{response.status_code}]: {response.text}")
                return False
            return True
        except Exception as e:
            print(f"Erro ao enviar WhatsApp: {str(e)}")
            return False

evolution_service = EvolutionService()
