from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.rag_service import rag_service

router = APIRouter()


class AssistenteRequest(BaseModel):
    pergunta: str = Field(min_length=3)
    produto: Literal["all", "solara_connect", "autoracer", "yachts_atlas"] = "all"
    publico: Literal["interno", "cliente"] = "interno"


@router.get("/status")
async def status():
    return {
        "status": "ok",
        "rag_documents": len(rag_service.chunks),
        "products": ["solara_connect", "autoracer", "yachts_atlas"],
    }


@router.post("/ask")
async def ask(payload: AssistenteRequest):
    try:
        result = await rag_service.ask(
            question=payload.pergunta,
            product=payload.produto,
            audience=payload.publico,
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro ao responder pergunta: {exc}") from exc
