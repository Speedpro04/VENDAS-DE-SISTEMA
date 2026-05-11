import requests
from app.core.config import settings
from app.core.supabase_client import supabase
import json

class OutscraperService:
    def __init__(self):
        self.api_key = settings.OUTSCRAPER_API_KEY
        self.base_url = "https://api.app.outscraper.com/maps/search-v2"

    async def scrape_and_save(self, query: str, limit: int, producto: str):
        if not self.api_key:
            print("ERRO: OUTSCRAPER_API_KEY não configurada.")
            return

        params = {
            "query": query,
            "limit": limit,
            "async": "false", # Vamos esperar o resultado para salvar logo
        }
        
        headers = {"X-API-KEY": self.api_key}
        
        try:
            response = requests.get(self.base_url, params=params, headers=headers)
            data = response.json()
            
            if "data" in data:
                results = data["data"][0] # Outscraper retorna lista de listas
                
                leads_to_insert = []
                for item in results:
                    lead = {
                        "nome": item.get("name"),
                        "telefone": item.get("phone"),
                        "email": item.get("email"),
                        "cidade": item.get("city"),
                        "segmento": item.get("type"),
                        "produto": producto,
                        "observacoes": f"Captado via Google Maps: {item.get('full_address')}"
                    }
                    # Apenas adiciona se tiver telefone ou email
                    if lead["telefone"] or lead["email"]:
                        leads_to_insert.append(lead)
                
                if leads_to_insert:
                    supabase.table("leads").insert(leads_to_insert).execute()
                    print(f"Sucesso: {len(leads_to_insert)} leads importados do Outscraper.")
                    
        except Exception as e:
            print(f"Erro ao processar Outscraper: {str(e)}")

outscraper_service = OutscraperService()
