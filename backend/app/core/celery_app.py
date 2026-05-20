from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "sqr_vendas",
    broker=settings.REDIS_URL,
    backend="rpc://",
    include=["app.tasks.spin_task", "app.tasks.scheduler_task"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    beat_schedule={
        # Verifica leads sem resposta a cada hora
        "verificar-leads-sem-resposta": {
            "task": "app.tasks.scheduler_task.verificar_leads_pendentes",
            "schedule": crontab(minute=0),  # A cada hora
        },
        # Disparo automático de leads novos (manhã: 8h, 8h20)
        "disparo-automatico-manha-8": {
            "task": "app.tasks.scheduler_task.disparar_leads_novos",
            "schedule": crontab(hour=8, minute=0),
        },
        "disparo-automatico-manha-8-20": {
            "task": "app.tasks.scheduler_task.disparar_leads_novos",
            "schedule": crontab(hour=8, minute=20),
        },
        # Disparo automático de leads novos (tarde: 14h, 14h20)
        "disparo-automatico-tarde-14": {
            "task": "app.tasks.scheduler_task.disparar_leads_novos",
            "schedule": crontab(hour=14, minute=0),
        },
        "disparo-automatico-tarde-14-20": {
            "task": "app.tasks.scheduler_task.disparar_leads_novos",
            "schedule": crontab(hour=14, minute=20),
        },
    },
)
