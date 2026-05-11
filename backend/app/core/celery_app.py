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
        # Disparo automático de leads novos (9h e 14h)
        "disparo-automatico-manha": {
            "task": "app.tasks.scheduler_task.disparar_leads_novos",
            "schedule": crontab(hour=9, minute=0),
        },
        "disparo-automatico-tarde": {
            "task": "app.tasks.scheduler_task.disparar_leads_novos",
            "schedule": crontab(hour=14, minute=0),
        },
    },
)
