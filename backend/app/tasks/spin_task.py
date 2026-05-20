from app.core.celery_app import celery_app
from app.core.supabase_client import supabase
from app.services.ai_service import ai_service
from app.services.evolution_service import evolution_service
import asyncio
from datetime import datetime, timezone

@celery_app.task(name="app.tasks.spin_task.processar_resposta_ai")
def processar_resposta_ai(lead_id, mensagem_cliente):
    # 1. Busca dados do lead e histórico
    lead_res = supabase.table("leads").select("*").eq("id", lead_id).execute()
    if not lead_res.data:
        return "Lead não encontrado"
    
    lead = lead_res.data[0]
    
    msg_res = supabase.table("mensagens").select("*").eq("lead_id", lead_id).order("created_at", desc=True).limit(5).execute()
    historico = "\n".join([f"{'Lead' if m['direcao'] == 'entrada' else 'Consultor'}: {m['conteudo']}" for m in reversed(msg_res.data)])

    # 2. Define o próximo estágio SPIN
    estagios = ["situacao", "problema", "implicacao", "necessidade"]
    estagio_atual = lead.get("estagio", "novo")
    
    # Lógica simples de progressão
    if estagio_atual == "novo" or estagio_atual == "situacao":
        proximo_estagio = "problema"
    elif estagio_atual == "problema":
        proximo_estagio = "implicacao"
    elif estagio_atual == "implicacao":
        proximo_estagio = "necessidade"
    else:
        proximo_estagio = "necessidade"

    # 3. Gera mensagem com IA
<<<<<<< Updated upstream
    # Celery tasks são síncronas por padrão, então usamos run_until_complete se necessário ou apenas tornamos o serviço síncrono
    # Para simplificar aqui, vamos usar um wrapper ou chamar síncrono
    mensagem_ia = asyncio.run(ai_service.gerar_mensagem_spin(
        lead["nome"], 
        lead["produto"], 
        historico, 
        proximo_estagio
    ))
=======
    try:
        mensagem_ia = asyncio.run(ai_service.gerar_mensagem_spin(
            lead["nome"], 
            lead["produto"], 
            historico, 
            proximo_estagio
        ))
    except RuntimeError:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        mensagem_ia = loop.run_until_complete(ai_service.gerar_mensagem_spin(
            lead["nome"], 
            lead["produto"], 
            historico, 
            proximo_estagio
        ))
>>>>>>> Stashed changes

    # 4. Envia mensagem via WhatsApp
    sucesso = evolution_service.send_whatsapp(lead["telefone"], mensagem_ia)
    
    if sucesso:
        # 5. Salva no banco e atualiza estágio
        supabase.table("mensagens").insert({
            "lead_id": lead_id,
            "direcao": "saida",
            "conteudo": mensagem_ia,
            "estagio_spin": proximo_estagio
        }).execute()

        # Registro detalhado de cada abordagem SPIN
        supabase.table("spin_logs").insert({
            "lead_id": lead_id,
            "estagio": proximo_estagio,
            "mensagem": mensagem_ia,
            "data_hora": "now()"
        }).execute()
        
        supabase.table("leads").update({
            "estagio": proximo_estagio,
            "ultima_resposta": datetime.now(timezone.utc).isoformat()
        }).eq("id", lead_id).execute()
        
    return f"Mensagem enviada para {lead['nome']}"
