import openai
from app.core.config import settings

class AIService:
    def __init__(self):
        self.client = openai.OpenAI(
            api_key=settings.AI_API_KEY,
            base_url=settings.AI_BASE_URL
        )

    async def gerar_mensagem_spin(self, lead_nome, produto, contexto_conversa, estagio_atual):
        prompts = {
            "solara_connect": {
                "situacao": f"O lead {lead_nome} é dono de uma clínica. O objetivo é entender a dor atual. Pergunte como ele lida com pacientes que não confirmam ou faltam hoje.",
                "problema": f"Foque na perda financeira. Ajude o lead a perceber que cada 'buraco' na agenda é lucro que nunca volta.",
                "implicacao": f"Gere urgência. Mostre que sem automação, a clínica está trabalhando para pagar custos fixos enquanto o lucro escorre pelo WhatsApp não respondido.",
                "necessidade": f"Solara Connect: a solução definitiva. Mostre como a automação de confirmação e recuperação de leads vai colocar dinheiro no bolso dele imediatamente."
            },
            "autoracer": {
                "situacao": f"O lead {lead_nome} busca um carro premium. Pergunte sobre o que ele mais valoriza em um veículo (conforto, status, performance).",
                "problema": f"Toque na insegurança do mercado de usados premium. O medo de pegar um carro com histórico oculto ou problemas mecânicos caros.",
                "implicacao": f"Ressalte que uma escolha errada em um carro premium não é apenas um erro, é um prejuízo de dezenas de milhares de reais.",
                "necessidade": f"Apresente a AutoRacer como o selo de confiança que filtra apenas o melhor do mercado, com auditoria completa para ele comprar sem medo."
            },
            "yachts_atlas": {
                "situacao": f"O lead {lead_nome} tem interesse em embarcações. Pergunte se ele já possui uma ou se está buscando a primeira experiência de alto luxo.",
                "problema": f"Exponha a 'dor do dono': a burocracia, a manutenção imprevisível e a dificuldade de manter a tripulação qualificada.",
                "implicacao": f"Explique como um iate mal gerido se torna um dreno de energia e dinheiro, em vez de um refúgio de prazer.",
                "necessidade": f"Yachts Atlas: a gestão inteligente. Transformamos a posse em puro prazer, cuidando de 100% da operação com transparência total."
            }
        }

        # Seleciona o prompt base
        prompt_base = prompts.get(produto, prompts["solara_connect"]).get(estagio_atual, "Conduza o lead para o próximo nível de interesse.")

        system_prompt = f"""
        Você é um Consultor de Vendas Sênior da SQR Vendas, especialista em SPIN Selling e persuasão psicológica.
        Seu tom é profissional, extremamente inteligente, mas próximo (brasileiro moderno).
        
        Sua missão: Dar "SABEDORIA" ao processo de vendas para que o lead venda CONSTANTEMENTE.
        
        Produto Atual: {produto}
        Lead: {lead_nome}
        Estágio do Funil: {estagio_atual}
        
        Instruções CRÍTICAS:
        1. NÃO use saudações padrão como "Olá" ou "Espero que esteja bem" se a conversa já começou. Vá direto ao ponto.
        2. Use o histórico para mostrar que você está ouvindo: {contexto_conversa}
        3. Nunca responda com mais de 300 caracteres. No WhatsApp, texto longo é ignorado.
        4. O objetivo de cada mensagem é obter UMA resposta. Termine sempre com uma pergunta provocativa ou de fechamento.
        5. Se o lead estiver no estágio 'necessidade', use gatilhos de escassez ou autoridade.
        6. {prompt_base}
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
