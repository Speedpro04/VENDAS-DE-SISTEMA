from fastapi import APIRouter
from app.tasks.scheduler_task import disparar_leads_novos, verificar_leads_pendentes

router = APIRouter()

@router.post("/trigger-now")
async def trigger_now():
    """Força o disparo de novos leads manualmente"""
    task = disparar_leads_novos.delay()
    return {"message": "Processamento manual iniciado", "task_id": task.id}

@router.post("/run-followups")
async def run_followups():
    """Força a verificação de follow-ups manualmente"""
    task = verificar_leads_pendentes.delay()
    return {"message": "Verificação de follow-ups iniciada", "task_id": task.id}
