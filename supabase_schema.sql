-- =============================================
-- SQR VENDAS — Schema Completo
-- =============================================

-- TABELA: leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  produto TEXT NOT NULL DEFAULT 'solara_connect',
  segmento TEXT,
  cidade TEXT,
  observacoes TEXT,
  estagio TEXT DEFAULT 'novo',
  canal TEXT DEFAULT 'whatsapp',
  ativo BOOLEAN DEFAULT true,
  tentativas INT DEFAULT 0,
  ultima_resposta TIMESTAMPTZ,
  dores_identificadas TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: mensagens
CREATE TABLE IF NOT EXISTS public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  direcao TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  canal TEXT DEFAULT 'whatsapp',
  estagio_spin TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: campanhas
CREATE TABLE IF NOT EXISTS public.campanhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  produto TEXT NOT NULL,
  status TEXT DEFAULT 'rascunho',
  total_leads INT DEFAULT 0,
  disparados INT DEFAULT 0,
  responderam INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: scheduler_jobs (para Celery)
CREATE TABLE IF NOT EXISTS public.scheduler_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  lead_id UUID REFERENCES public.leads(id),
  campanha_id UUID REFERENCES public.campanhas(id),
  agendado_para TIMESTAMPTZ NOT NULL,
  executado BOOLEAN DEFAULT false,
  resultado TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TABELA: spin_logs (registro de TODAS as abordagens SPIN)
CREATE TABLE IF NOT EXISTS public.spin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  estagio TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  canal TEXT DEFAULT 'whatsapp',
  enviado BOOLEAN DEFAULT true,
  erro TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_leads_produto ON public.leads(produto);
CREATE INDEX IF NOT EXISTS idx_leads_estagio ON public.leads(estagio);
CREATE INDEX IF NOT EXISTS idx_leads_ativo ON public.leads(ativo);
CREATE INDEX IF NOT EXISTS idx_mensagens_lead ON public.mensagens(lead_id);
CREATE INDEX IF NOT EXISTS idx_scheduler_agendado ON public.scheduler_jobs(agendado_para) WHERE NOT executado;
CREATE INDEX IF NOT EXISTS idx_spin_logs_lead ON public.spin_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_spin_logs_estagio ON public.spin_logs(estagio);
CREATE INDEX IF NOT EXISTS idx_spin_logs_created ON public.spin_logs(created_at);

-- TRIGGER: updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduler_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_logs ENABLE ROW LEVEL SECURITY;

-- Policies (acesso aberto para o service_role, anon pode ler/escrever)
CREATE POLICY "leads_all" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "mensagens_all" ON public.mensagens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "campanhas_all" ON public.campanhas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "scheduler_all" ON public.scheduler_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "spin_logs_all" ON public.spin_logs FOR ALL USING (true) WITH CHECK (true);
