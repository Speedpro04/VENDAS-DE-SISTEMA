from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.lead import Lead, LeadCreate, LeadUpdate
from app.core.supabase_client import supabase
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=Lead)
async def create_lead(lead: LeadCreate):
    response = supabase.table("leads").insert(lead.dict()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Erro ao criar lead")
    return response.data[0]

@router.get("/", response_model=List[Lead])
async def get_leads(
    produto: Optional[str] = None,
    estagio: Optional[str] = None,
    search: Optional[str] = None
):
    query = supabase.table("leads").select("*")
    if produto:
        query = query.eq("produto", produto)
    if estagio:
        query = query.eq("estagio", estagio)
    if search:
        query = query.ilike("nome", f"%{search}%")
    
    response = query.order("created_at", desc=True).execute()
    return response.data

@router.get("/{lead_id}", response_model=Lead)
async def get_lead(lead_id: UUID):
    response = supabase.table("leads").select("*").eq("id", str(lead_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    return response.data[0]

@router.patch("/{lead_id}", response_model=Lead)
async def update_lead(lead_id: UUID, lead_update: LeadUpdate):
    response = supabase.table("leads").update(lead_update.dict(exclude_unset=True)).eq("id", str(lead_id)).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Erro ao atualizar lead")
    return response.data[0]

@router.delete("/{lead_id}")
async def delete_lead(lead_id: UUID):
    response = supabase.table("leads").delete().eq("id", str(lead_id)).execute()
    return {"status": "success"}
