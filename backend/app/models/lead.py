from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class LeadBase(BaseModel):
    nome: str
    telefone: Optional[str] = None
    email: Optional[str] = None
    produto: str = "solara_connect"
    segmento: Optional[str] = None
    cidade: Optional[str] = None
    observacoes: Optional[str] = None
    canal: str = "whatsapp"

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    produto: Optional[str] = None
    segmento: Optional[str] = None
    cidade: Optional[str] = None
    observacoes: Optional[str] = None
    estagio: Optional[str] = None
    ativo: Optional[bool] = None

class Lead(LeadBase):
    id: UUID
    estagio: str
    ativo: bool
    tentativas: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
