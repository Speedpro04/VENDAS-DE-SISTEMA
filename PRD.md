# Product Requirements Document (PRD) - SQR Vendas

## 1. Visão Geral do Produto
O **SQR Vendas (Sistema de Qualificação e Relacionamento)** é uma ferramenta pessoal e exclusiva de CRM e automação de vendas. Ele utiliza a metodologia **SPIN Selling** aliada à Inteligência Artificial (RAG/NVIDIA/Claude) para conduzir negociações, qualificar leads e fechar vendas de forma autônoma e inteligente via WhatsApp (Evolution API).

### 1.1 Objetivos Principais
- Automatizar o primeiro contato e o "follow-up" com leads.
- Extrair dores reais dos clientes aplicando a técnica SPIN (Situação, Problema, Implicação, Necessidade).
- Servir como hub de vendas para os três produtos principais do ecossistema: **Solara Connect**, **Auto Racer** e **Yachts Atlas**.
- Centralizar o acompanhamento do funil de vendas em um painel kanban visual e em tempo real.

---

## 2. Usuários Alvo
**Administrador / Consultor Sênior (Uso Interno e Exclusivo):**
O sistema é projetado para um único operador de alto nível que necessita escalar sua capacidade de atendimento sem perder a personalização. Acesso através de "1-Click Login" (Sem senhas complexas de rotina).

---

## 3. Escopo e Funcionalidades (Features)

### 3.1 Funil Kanban (SPIN)
- Estágios automatizados baseados em metodologias reais de vendas: `Novo` > `Situação` > `Problema` > `Implicação` > `Necessidade` > `Proposta` > `Fechado` / `Perdido`.
- Movimentação automática via IA ou drag-and-drop manual.

### 3.2 Gestão de Leads
- Captura manual ou via importação em massa (CSV).
- Enriquecimento rápido de dados: Nome, Produto, Segmento, Telefone e Cidade.
- Histórico completo da conversa (Auditoria): Capacidade de visualizar toda a transcrição do bate-papo gerado pela IA.

### 3.3 Inteligência Artificial & RAG
- **Motor de Raciocínio:** Integração com LLMs (ex: DeepSeek-V4/Claude) atuando com persona de Consultor Sênior.
- **RAG (Retrieval-Augmented Generation):** Base de conhecimento estruturada (Obsidian/Markdown) com gatilhos e 300+ frases testadas para os três nichos. A IA extrai exatamente a frase certa para o momento certo.
- **Integração WhatsApp:** Disparo silencioso via webhook e Evolution API.

### 3.4 Interface (UI/UX)
- Design system premium (Cores: Verde `#006266`, Ouro `#C9A84C`, Fundo `#0F0F14`).
- Fontes modernas (Montserrat 19px, bold 600) visando conforto em longas sessões de uso.
- Indicador de status do sistema (Online/Offline) e painel lateral intuitivo.

---

## 4. Produtos e Estratégia Comercial

1. **Solara Connect (Clínicas e Saúde):** Foco em resolver "no-shows", automação de agendamentos e recuperação de pacientes via WhatsApp.
2. **Auto Racer (Concessionárias do Vale do Paraíba):** Foco em alcance local, vídeos curtos no estoque e redução de custos vs grandes portais.
3. **Yachts Atlas (Embarcações de Luxo):** Foco em dossiê digital, segurança, auditoria e gestão de ativos de alto padrão.

---

## 5. Requisitos Não-Funcionais
- **Performance:** Carregamento ultra-rápido (Vite/React).
- **Segurança:** Uso interno isolado; Supabase Row Level Security (RLS) protegido.
- **Integração Backend:** FastAPI conectando filas do Celery e Redis para garantir que o envio de mensagens não seja bloqueado.

---

## 6. Próximos Passos (Roadmap)
- [x] **Enriquecimento do RAG:** Popular o sistema com 100 variações de frases por produto (totalizando 300) mapeadas para cada fase do SPIN Selling.
- [x] **Integração do Obsidian:** Estruturar a base de conhecimento (Knowledge Base) usando Markdown para ingestão fácil da IA.
- [ ] **Deploy de Produção:** Subida do frontend via EasyPanel e conexão definitiva do webhook da Evolution API no ambiente live.
