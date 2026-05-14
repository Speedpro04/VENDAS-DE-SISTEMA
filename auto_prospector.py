import os
import json
import time
from playwright.sync_api import sync_playwright
from supabase import create_client, Client
from dotenv import load_dotenv

# Configurações de Ambiente
env_path = os.path.join("VENDAS-DE-SISTEMA", ".env")
load_dotenv(env_path)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE") or os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Erro: Credenciais do Supabase nao encontradas no .env do SQR Vendas.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_product_and_segment(category):
    cat = category.lower()
    if "marina" in cat:
        return "yachts_atlas", "Marina"
    elif "clinica" in cat:
        return "solara_connect", "Clínica Médica"
    elif "dentista" in cat:
        return "solara_connect", "Dentista"
    elif "veiculo" in cat or "carro" in cat:
        return "auto_racer", "Loja de Veículos"
    return "solara_connect", category

def is_duplicate(phone):
    if not phone: return False
    res = supabase.table("leads").select("id").eq("telefone", phone).execute()
    return len(res.data) > 0

def save_to_supabase(lead_data):
    try:
        if is_duplicate(lead_data["telefone"]):
            print(f"Lead duplicado (pulando): {lead_data['nome']} - {lead_data['telefone']}")
            return False
        
        supabase.table("leads").insert(lead_data).execute()
        print(f"Lead inserido com sucesso: {lead_data['nome']}")
        return True
    except Exception as e:
        print(f"Erro ao inserir no Supabase: {e}")
        return False

def scrape_and_push(query, category, max_results=20):
    product, segment = get_product_and_segment(category)
    print(f"\nIniciando busca: '{query}' ({category})")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(locale="pt-BR")
        page = context.new_page()
        
        try:
            page.goto(f"https://www.google.com/maps/search/{query.replace(' ', '+')}")
            # Esperar o feed ou os resultados carregarem
            try:
                page.wait_for_selector('div[role="feed"]', timeout=15000)
            except:
                print("Aviso: Feed nao carregou em 15s. Tentando extrair o que estiver na tela.")

            # Scroll para carregar mais resultados
            for i in range(3):
                page.mouse.wheel(0, 5000)
                time.sleep(2)

            # Seletores de itens de resultado (Google Maps muda isso com frequência)
            items = page.query_selector_all('div[role="article"]') or \
                    page.query_selector_all('div[role="feed"] > div > div[jsaction]') or \
                    page.query_selector_all('a[href*="/maps/place/"]')

            count = 0
            for item in items:
                if count >= max_results: break
                
                try:
                    text = item.inner_text()
                    if not text or len(text) < 15: continue
                    
                    lines = text.split('\n')
                    name = lines[0].strip()
                    
                    phone = ""
                    address = ""
                    
                    # Regex simples para telefone brasileiro ou busca por padrão
                    for line in lines:
                        if ('(' in line and ')' in line) or (line.replace(' ', '').replace('-', '').isdigit() and len(line) > 8):
                            phone = line.strip()
                        elif 'R.' in line or 'Av.' in line or 'Rua' in line or 'Estrada' in line:
                            address = line.strip()

                    if name and phone:
                        lead = {
                            "nome": name,
                            "telefone": phone,
                            "produto": product,
                            "segmento": segment,
                            "cidade": "Vale do Paraíba / Litoral SP",
                            "observacoes": f"Fonte: Google Maps | Endereço: {address}",
                            "estagio": "novo",
                            "ativo": True
                        }
                        if save_to_supabase(lead):
                            count += 1
                except Exception as e:
                    continue

            print(f"Fim da busca: {count} leads novos processados para {category}.")
            
        except Exception as e:
            print(f"Erro fatal durante o scraping: {e}")
        finally:
            browser.close()

def main():
    tasks = [
        ("Marinas Litoral Norte SP", "Marina", 30),
        ("Marinas Guarujá Bertioga", "Marina", 30),
        ("Clínica Médica São José dos Campos", "Clinica", 40),
        ("Dentista Taubaté", "Dentista", 40),
        ("Loja de Veículos São José dos Campos", "Veiculo", 50),
        ("Loja de Carros Usados Taubaté", "Veiculo", 50)
    ]
    
    print("SISTEMA DE PROSPECCAO AUTOMATICA INICIADO")
    print("-------------------------------------------")
    
    for query, category, limit in tasks:
        scrape_and_push(query, category, limit)
        time.sleep(2) # Pausa entre buscas

    print("\nPROCESSO CONCLUIDO! Todos os leads novos ja estao no seu funil do SQR Vendas.")

if __name__ == "__main__":
    main()
