# Solara Connect - Pronto para Uso

## Estado Atual
- Assistente IA com RAG ativo
- Produto padrao da tela: `solara_connect`
- Publico padrao: `cliente`
- Tela: `Tira-Duvidas IA`

## Como usar agora
1. Abra a tela `Tira-Duvidas IA`.
2. Confirme produto `Solara Connect`.
3. Escreva a duvida do cliente.
4. Envie e use a resposta sugerida.

## Perguntas prontas para atendimento
- Como o Solara Connect reduz faltas na agenda?
- Como funciona a confirmacao automatica de consultas?
- Voces ajudam a recuperar pacientes que sumiram?
- O que muda no dia a dia da recepcao?
- Em quanto tempo da para perceber resultado?

## Respostas comerciais curtas (base)
- Reducao de no-show com confirmacao automatizada e reengajamento inteligente.
- Menos operacao manual da recepcao e mais previsibilidade de comparecimento.
- Fluxos personalizados por perfil e historico para aumentar resposta sem soar robotico.

## Proximo passo comercial padrao
"Se fizer sentido, iniciamos um teste controlado de 7 dias em uma unidade para medir impacto real de comparecimento."

## Rotas de API
- `GET /assistente/status`
- `POST /assistente/ask`

## Observacao
Para ampliar precisao, continue alimentando `backend/app/knowledge/solara_connect.md` com FAQs reais, objecoes e casos de sucesso.
