from fastapi import APIRouter, HTTPException
from typing import List
from app.core.supabase_client import supabase
from pydantic import BaseModel

router = APIRouter()

class Campanha(BaseModel):
    nome: str
    produto: str

@router.get("/")
async def list_campanhas():
    response = supabase.table("campanhas").select("*").execute()
    return response.data

@router.post("/")
async def create_campanha(campanha: Campanha):
    response = supabase.table("campanhas").insert(campanha.dict()).execute()
    return response.data[0]

@router.delete("/{id}")
async def delete_campanha(id: str):
    supabase.table("campanhas").delete().eq("id", id).execute()
    return {"status": "deleted"}
