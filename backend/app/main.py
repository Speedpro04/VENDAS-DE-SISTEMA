from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import leads, webhook, campanhas, outscraper, scheduler
from app.core.config import settings

app = FastAPI(title="SQR Vendas API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router, prefix="/leads", tags=["Leads"])
app.include_router(webhook.router, prefix="/webhook", tags=["Webhook"])
app.include_router(campanhas.router, prefix="/campanhas", tags=["Campanhas"])
app.include_router(outscraper.router, prefix="/outscraper", tags=["Outscraper"])
app.include_router(scheduler.router, prefix="/scheduler", tags=["Scheduler"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "SQR Vendas"}
