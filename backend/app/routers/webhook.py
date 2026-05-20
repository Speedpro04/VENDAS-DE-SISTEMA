from fastapi import APIRouter, Request
from app.core.supabase_client import supabase
from app.tasks.spin_task import processar_resposta_ai

router = APIRouter()

def _only_digits(value: str) -> str:
    return "".join(ch for ch in (value or "") if ch.isdigit())

def _extract_text(message: dict) -> str:
    if not isinstance(message, dict):
        return ""
    if "conversation" in message:
        return message.get("conversation", "") or ""
    if "extendedTextMessage" in message:
        return (message.get("extendedTextMessage") or {}).get("text", "") or ""
    if "imageMessage" in message:
        return (message.get("imageMessage") or {}).get("caption", "") or ""
    if "videoMessage" in message:
        return (message.get("videoMessage") or {}).get("caption", "") or ""
    if "buttonsResponseMessage" in message:
        return (message.get("buttonsResponseMessage") or {}).get("selectedDisplayText", "") or ""
    if "listResponseMessage" in message:
        return (message.get("listResponseMessage") or {}).get("title", "") or ""
    return ""

@router.post("/evolution")
async def evolution_webhook(request: Request):
    payload = await request.json()
    
    # Evolution API envia diferentes tipos de eventos
    event_type = payload.get("event")
    
    if event_type == "messages.upsert":
        data = payload.get("data", {})
        if isinstance(data, list):
            data = data[0] if data else {}
        message = data.get("message", {})
        key = data.get("key", {})
        
        # Ignora se for mensagem enviada por nós
        if key.get("fromMe"):
            return {"status": "ignored"}
            
        remote_jid = key.get("remoteJid") # Ex: 5511999999999@s.whatsapp.net
        if not remote_jid or "@" not in remote_jid:
            return {"status": "ignored_invalid_sender"}
        if remote_jid.endswith("@g.us") or remote_jid == "status@broadcast":
            return {"status": "ignored_non_direct_chat"}
        phone = remote_jid.split("@")[0]
        phone_digits = _only_digits(phone)
        if not phone_digits:
            return {"status": "ignored_invalid_phone"}
        
        # Conteúdo da mensagem
        text = _extract_text(message).strip()
            
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
