from fastapi import APIRouter, Request
from app.core.supabase_client import supabase
from app.tasks.spin_task import processar_resposta_ai

router = APIRouter()

def _only_digits(value: str) -> str:
    return "".join(ch for ch in (value or "") if ch.isdigit())

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
        if not remote_jid or "@" not in remote_jid:
            return {"status": "ignored_invalid_sender"}
        phone = remote_jid.split("@")[0]
        phone_digits = _only_digits(phone)
        
        # Conteúdo da mensagem
        text = ""
        if "conversation" in message:
            text = message["conversation"]
        elif "extendedTextMessage" in message:
            text = message["extendedTextMessage"].get("text", "")
            
        if not text:
            return {"status": "no_text"}
            
        # 1. Busca o lead pelo telefone (com fallback para diferentes formatos)
        response = supabase.table("leads").select("*").ilike("telefone", f"%{phone_digits}%").eq("ativo", True).execute()
        if not response.data and phone_digits.startswith("55"):
            local_phone = phone_digits[2:]
            response = supabase.table("leads").select("*").ilike("telefone", f"%{local_phone}%").eq("ativo", True).execute()
        
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

        # Se não encontrou lead, registra somente para auditoria
        supabase.table("mensagens").insert({
            "direcao": "entrada",
            "conteudo": text,
            "canal": "whatsapp"
        }).execute()
        return {"status": "received_without_lead", "phone": phone_digits}
            
    return {"status": "received"}
