import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente do repositório clonado
env_path = os.path.join("VENDAS-DE-SISTEMA", ".env")
load_dotenv(env_path)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE") or os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Erro: SUPABASE_URL ou SUPABASE_KEY não encontrados no .env")
    exit(1)

supabase: Client = create_client(url, key)

def get_product_and_segment(category):
    cat = category.lower()
    if "marina" in cat:
        return "yachts_atlas", "Marina"
    elif "médica" in cat or "clinica" in cat:
        return "solara_connect", "Clínica Médica"
    elif "dentista" in cat:
        return "solara_connect", "Dentista"
    elif "veículo" in cat or "carro" in cat:
        return "auto_racer", "Loja de Veículos"
    return "solara_connect", category

def import_leads():
    file_path = "prospeccao_dados_gmaps.json"
    if not os.path.exists(file_path):
        print(f"Erro: Arquivo {file_path} não encontrado.")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    leads_to_insert = []
    
    for category, items in data.items():
        product, segment = get_product_and_segment(category)
        print(f"Processando categoria: {category} -> Produto: {product}")
        
        for item in items:
            lead = {
                "nome": item.get("Nome", "Sem Nome"),
                "telefone": item.get("Telefone", ""),
                "produto": product,
                "segmento": segment,
                "cidade": "Vale do Paraíba / Litoral SP", # Padronizado para a região da busca
                "observacoes": f"Endereço: {item.get('Endereço', '')}",
                "estagio": "novo",
                "ativo": True
            }
            leads_to_insert.append(lead)

    print(f"Total de leads para inserir: {len(leads_to_insert)}")

    # Inserir em blocos de 50 para evitar erros de payload
    batch_size = 50
    for i in range(0, len(leads_to_insert), batch_size):
        batch = leads_to_insert[i:i + batch_size]
        try:
            response = supabase.table("leads").insert(batch).execute()
            print(f"Inseridos {len(batch)} leads... ({i + len(batch)}/{len(leads_to_insert)})")
        except Exception as e:
            print(f"Erro ao inserir bloco: {e}")

if __name__ == "__main__":
    import_leads()
