from app.core.celery_app import celery_app
from app.core.supabase_client import supabase
from app.tasks.spin_task import processar_resposta_ai
from datetime import datetime, timedelta

@celery_app.task(name="app.tasks.scheduler_task.verificar_leads_pendentes")
def verificar_leads_pendentes():
    """
    Verifica leads que não responderam há mais de 24 horas e envia um follow-up.
    """
    agora = datetime.now()
    limite = agora - timedelta(hours=24)
    
    # Busca leads ativos que não tiveram resposta recente
    response = supabase.table("leads")\
        .select("*")\
        .eq("ativo", True)\
        .lt("ultima_resposta", limite.isoformat())\
        .execute()
        
    for lead in response.data:
        # Re-dispara o processo da IA para um follow-up de "Implicação" ou "Necessidade"
        processar_resposta_ai.delay(lead["id"], "Follow-up automático")
        
    return f"Processados {len(response.data)} follow-ups."

@celery_app.task(name="app.tasks.scheduler_task.disparar_leads_novos")
def disparar_leads_novos():
    """
    Pega leads com estágio 'novo' e inicia a conversa.
    """
    response = supabase.table("leads")\
        .select("*")\
        .eq("estagio", "novo")\
        .eq("ativo", True)\
        .limit(50)\
        .execute()
        
    for lead in response.data:
        # Inicia o SPIN com 'situacao'
        processar_resposta_ai.delay(lead["id"], "Início de conversa")
        
    return f"Iniciadas {len(response.data)} novas conversas."
