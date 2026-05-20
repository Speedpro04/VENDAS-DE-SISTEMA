import openai
from app.core.config import settings

class AIService:
    def __init__(self):
        self.client = openai.OpenAI(
            api_key=settings.AI_API_KEY,
            base_url=settings.AI_BASE_URL
        )

    async def gerar_mensagem_spin(self, lead_nome, produto, contexto_conversa, estagio_atual):
        produto_normalizado = (produto or "").strip().lower()
        contexto = (contexto_conversa or "").lower()

        prompts = {
            "solara_connect": {
                "situacao": f"O lead {lead_nome} é gestor de clínica. Descubra volume de no-show, taxa de confirmação e esforço manual da recepção.",
                "problema": "Aprofunde a dor financeira: agenda furada, equipe sobrecarregada e paciente inativo sem recontato.",
                "implicacao": "Mostre impacto mensal com números simples: cada horário vazio é receita perdida e custo fixo mantido.",
                "necessidade": "Posicione Solara Connect com 7 dias de teste controlado: confirmação automática, reativação e ganho de ocupação."
            },
            "autoracer": {
                "situacao": f"O lead {lead_nome} avalia carro premium. Descubra prazo de compra, faixa de investimento e critérios de confiança.",
                "problema": "Explore medo de histórico oculto, custo pós-compra e perda de oportunidade por follow-up tardio.",
                "implicacao": "Conecte risco a dinheiro e reputação: decisão errada no premium gera prejuízo alto e retrabalho.",
                "necessidade": "Posicione AutoRacer com prova de confiança e processo consultivo: triagem, procedência e próxima ação clara."
            },
            "yachts_atlas": {
                "situacao": f"O lead {lead_nome} tem interesse náutico premium. Descubra perfil, objetivo de uso e momento de decisão.",
                "problema": "Traga a dor de ciclo longo sem governança: proposta esfria, follow-up falha e carteira perde ritmo.",
                "implicacao": "Mostre custo de oportunidade alto: negociações de alto valor travam por falta de cadência elegante.",
                "necessidade": "Posicione Yachts Atlas com relacionamento premium previsível: cadência discreta, controle de fases e avanço de carteira."
            }
        }

        playbooks = {
            "solara_connect": "Tom consultivo e objetivo de agenda. Sempre puxar para métrica concreta: faltas, confirmações e ocupação.",
            "autoracer": "Tom de confiança premium. Valorizar procedência, segurança da decisão e rapidez sem pressão.",
            "yachts_atlas": "Tom elegante e discreto. Foco em previsibilidade de carteira e experiência de alto padrão."
        }

        objecoes = []
        if any(t in contexto for t in ["caro", "preço", "preco", "valor", "orçamento", "orcamento"]):
            objecoes.append("Se houver objeção de preço, responda com ROI e risco de manter como está, sem dar desconto automático.")
        if any(t in contexto for t in ["já uso", "ja uso", "já temos", "ja temos", "crm", "planilha"]):
            objecoes.append("Se já usa ferramenta, posicione como camada de cadência e inteligência, não substituição brusca.")
        if any(t in contexto for t in ["sem tempo", "depois", "agora não", "agora nao"]):
            objecoes.append("Se houver falta de tempo, proponha próximo passo mínimo: teste curto com meta objetiva.")
        if any(t in contexto for t in ["não quero", "nao quero", "robot", "robô", "robo", "spam"]):
            objecoes.append("Se houver medo de automação fria, reforçe personalização e controle humano nas mensagens.")

        # Seleciona o prompt base
        produto_cfg = prompts.get(produto_normalizado, prompts["solara_connect"])
        prompt_base = produto_cfg.get(estagio_atual, "Conduza o lead para o próximo nível de interesse.")
        playbook = playbooks.get(produto_normalizado, playbooks["solara_connect"])
        bloco_objecoes = " ".join(objecoes) if objecoes else "Antecipe a objeção mais provável do lead e responda antes da pergunta final."

        system_prompt = f"""
        Você é um Consultor de Vendas e Suporte Sênior da SQR Vendas, operando 24/7. 
        Você é especialista em SPIN Selling, persuasão psicológica e em sanar dúvidas técnicas ou comerciais com clareza e autoridade.
        Seu tom é profissional, extremamente inteligente, mas próximo (brasileiro moderno).
        
        Sua missão: Dar "SABEDORIA" ao processo de vendas para que o lead venda CONSTANTEMENTE e sinta-se totalmente amparado em suas dúvidas.
        
        Produto Atual: {produto}
        Lead: {lead_nome}
        Estágio do Funil: {estagio_atual}
        
        Instruções CRÍTICAS:
        1. NÃO use saudações padrão como "Olá" ou "Espero que esteja bem" se a conversa já começou. Vá direto ao ponto.
        2. Use o histórico para mostrar que você está ouvindo: {contexto_conversa}
        3. Nunca responda com mais de 300 caracteres. No WhatsApp, texto longo é ignorado.
        4. O objetivo de cada mensagem é obter UMA resposta. Termine sempre com uma pergunta provocativa ou de fechamento.
        5. Se o lead tiver uma dúvida, responda com autoridade antes de seguir com a técnica de SPIN.
        6. Se o lead estiver no estágio 'necessidade', use gatilhos de escassez ou autoridade.
        7. {prompt_base}
        8. Playbook do produto: {playbook}
        9. {bloco_objecoes}
        10. Estrutura obrigatória: Dor/ganho em 1 frase + prova/segurança em 1 frase + pergunta final de avanço.
        """

        try:
            response = self.client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Lead {lead_nome} respondeu: '{contexto_conversa[-100:] if contexto_conversa else 'Início'}'\n\nGere a resposta para o estágio {estagio_atual}."}
                ],
                temperature=0.75
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Erro na IA: {str(e)}")
            return "Entendo perfeitamente sua visão. Para avançarmos, você teria 2 minutos para uma breve ligação ou prefere seguir por aqui?"

ai_service = AIService()
