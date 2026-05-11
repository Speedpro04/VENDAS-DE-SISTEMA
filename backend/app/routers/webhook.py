from fastapi import APIRouter, Request, Header, HTTPException
from app.core.supabase_client import supabase
from app.tasks.spin_task import processar_resposta_ai
import json

router = APIRouter()

@router.post("/evolution")
async def evolution_webhook(request: Request):
    payload = await request.json()
    
    # Evolution API envia diferentes tipos de eventos
    event_type = payload.get("event")
    
    if event_type == "messages.upsert":
        data = payload.get("data", {})
        message = data.get("message", {})
        key = data.get("key", {})
        
        # Ignora se for mensagem enviada por nós
        if key.get("fromMe"):
            return {"status": "ignored"}
            
        remote_jid = key.get("remoteJid") # Ex: 5511999999999@s.whatsapp.net
        phone = remote_jid.split("@")[0]
        
        # Conteúdo da mensagem
        text = ""
        if "conversation" in message:
            text = message["conversation"]
        elif "extendedTextMessage" in message:
            text = message["extendedTextMessage"].get("text", "")
            
        if not text:
            return {"status": "no_text"}
            
        # 1. Busca o lead pelo telefone
        response = supabase.table("leads").select("*").ilike("telefone", f"%{phone}%").eq("ativo", True).execute()
        
        if response.data:
            lead = response.data[0]
            
            # 2. Salva a mensagem recebida
            supabase.table("mensagens").insert({
                "lead_id": lead["id"],
                "direcao": "entrada",
                "conteudo": text,
                "canal": "whatsapp"
            }).execute()
            
            # 3. Dispara tarefa da IA para processar o SPIN Selling
            processar_resposta_ai.delay(lead["id"], text)
            
            return {"status": "processing", "lead_id": lead["id"]}
            
    return {"status": "received"}
