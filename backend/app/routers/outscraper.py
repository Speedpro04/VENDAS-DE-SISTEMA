from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from app.services.outscraper_service import outscraper_service
from app.core.supabase_client import supabase

router = APIRouter()

class ScrapingRequest(BaseModel):
    query: str
    limit: int = 20
    produto: str = "solara_connect"

@router.post("/scrape")
async def start_scraping(request: ScrapingRequest, background_tasks: BackgroundTasks):
    # Inicia o scraping em background para não travar a UI
    background_tasks.add_task(
        outscraper_service.scrape_and_save, 
        request.query, 
        request.limit, 
        request.produto
    )
    return {"message": "Processo de captação iniciado em segundo plano.", "query": request.query}

@router.get("/status")
async def get_scraping_status():
    # Aqui poderíamos ter um controle mais fino de jobs, 
    # por agora vamos apenas retornar que está operando.
    return {"status": "operando"}
