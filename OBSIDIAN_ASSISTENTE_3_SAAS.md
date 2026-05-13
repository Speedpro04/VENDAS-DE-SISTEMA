# Assistente IA SQR - RAG dos 3 SaaS

## Visao Geral
Este sistema interno agora possui um Assistente IA com RAG para:
- Solara Connect
- AutoRacer
- Yachts Atlas

Ele responde duvidas operacionais, comerciais e tecnicas com base em conhecimento separado por produto.

## Objetivo
Transformar o sistema de vendas em um centro de inteligencia para:
- Uso interno da equipe
- Conversa com clientes contratantes
- Apoio em objecoes, scripts e proximos passos comerciais

## Arquitetura Implementada
### Backend
- Rota de status: `GET /assistente/status`
- Rota de perguntas: `POST /assistente/ask`
- Servico RAG: `backend/app/services/rag_service.py`

### Frontend
- Pagina: `Tira-Duvidas IA`
- Seletor de produto: Todos | Solara | AutoRacer | Yachts
- Seletor de publico:
  - `interno`
  - `cliente`

## Base de Conhecimento (RAG)
Cada SaaS possui arquivo proprio:
- `backend/app/knowledge/solara_connect.md`
- `backend/app/knowledge/autoracer.md`
- `backend/app/knowledge/yachts_atlas.md`

## Comportamento do Assistente
### Modo Interno
Respostas objetivas com foco em execucao e decisao.

### Modo Cliente
Linguagem comercial clara, sem excesso de jargao tecnico.

## Exemplo de Requisicao
```json
{
  "pergunta": "Como o Solara Connect reduz faltas?",
  "produto": "solara_connect",
  "publico": "cliente"
}
```

## Exemplo de Resposta Esperada
- Explicacao simples do valor do produto
- Passos praticos de adocao
- Fontes usadas no RAG

## Checklist de Expansao
- [ ] Adicionar novos playbooks por nicho
- [ ] Incluir FAQs reais de clientes
- [ ] Ingerir materiais extras (PDF, SOP, propostas)
- [ ] Versionar conhecimento por produto

## Notas Operacionais
- Se a pergunta nao tiver contexto suficiente, o assistente deve sinalizar limite e sugerir proximo passo.
- Evitar prometer funcionalidade fora da base de conhecimento.

## Historico
- Implementacao publicada em `main`
- Commit: `d7b5c5d`
