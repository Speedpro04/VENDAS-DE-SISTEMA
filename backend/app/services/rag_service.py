from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Literal

import openai

from app.core.config import settings

ProductKey = Literal["solara_connect", "autoracer", "yachts_atlas"]

PRODUCT_FILES: dict[str, str] = {
    "solara_connect": "solara_connect.md",
    "autoracer": "autoracer.md",
    "yachts_atlas": "yachts_atlas.md",
}


@dataclass
class Chunk:
    product: str
    source: str
    text: str
    tokens: set[str]


class RAGService:
    def __init__(self) -> None:
        self.client = openai.OpenAI(api_key=settings.AI_API_KEY, base_url=settings.AI_BASE_URL)
        self.knowledge_dir = Path(__file__).resolve().parent.parent / "knowledge"
        self.chunks = self._load_knowledge()

    def _tokenize(self, text: str) -> set[str]:
        words = re.findall(r"[a-zA-Z0-9_]{3,}", text.lower())
        return set(words)

    def _chunk_text(self, text: str, chunk_size: int = 700) -> Iterable[str]:
        raw_parts = [p.strip() for p in text.split("\n\n") if p.strip()]
        bucket: list[str] = []
        current_size = 0
        for part in raw_parts:
            if current_size + len(part) > chunk_size and bucket:
                yield "\n\n".join(bucket)
                bucket = [part]
                current_size = len(part)
            else:
                bucket.append(part)
                current_size += len(part)
        if bucket:
            yield "\n\n".join(bucket)

    def _load_knowledge(self) -> list[Chunk]:
        chunks: list[Chunk] = []
        for product, filename in PRODUCT_FILES.items():
            path = self.knowledge_dir / filename
            if not path.exists():
                continue
            content = path.read_text(encoding="utf-8")
            for piece in self._chunk_text(content):
                chunks.append(
                    Chunk(
                        product=product,
                        source=filename,
                        text=piece,
                        tokens=self._tokenize(piece),
                    )
                )
        return chunks

    def _search(self, question: str, product: str | None, limit: int = 6) -> list[Chunk]:
        q_tokens = self._tokenize(question)
        candidates = [c for c in self.chunks if product in (None, "all") or c.product == product]

        scored: list[tuple[int, Chunk]] = []
        for chunk in candidates:
            overlap = len(q_tokens.intersection(chunk.tokens))
            if overlap > 0:
                scored.append((overlap, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored[:limit]]

    async def ask(self, question: str, product: str | None, audience: str) -> dict:
        top_chunks = self._search(question=question, product=product)

        context = "\n\n".join(
            [f"[Fonte: {c.source} | Produto: {c.product}]\n{c.text}" for c in top_chunks]
        )

        audience_tone = {
            "interno": "Fale como especialista interno, objetivo e com recomendacoes acionaveis.",
            "cliente": "Fale em linguagem comercial clara para clientes contratantes, sem jargao tecnico desnecessario.",
        }.get(audience, "Fale com clareza e objetividade.")

        system_prompt = f"""
Voce e o Assistente SQR para os tres SaaS: Solara Connect, AutoRacer e Yachts Atlas.
{audience_tone}
Atue como especialista em vendas consultivas B2B e em produto para os tres sistemas.

Regras:
1) Responda em portugues do Brasil.
2) Use primeiro o contexto RAG. Se faltar contexto, diga isso explicitamente e ofereca o proximo passo.
3) Nunca invente funcionalidade que nao exista no contexto.
4) Quando possivel, entregue resposta estruturada em passos curtos.
5) Em pedidos comerciais, inclua: diagnostico rapido, argumento de valor e proximo passo de fechamento.
"""

        user_prompt = f"""
Pergunta: {question}
Produto selecionado: {product or 'all'}

Contexto RAG:
{context if context else 'Sem contexto relevante encontrado.'}
"""

        response = self.client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt.strip()},
                {"role": "user", "content": user_prompt.strip()},
            ],
            temperature=0.35,
        )

        answer = response.choices[0].message.content or "Nao consegui gerar uma resposta agora."
        return {
            "answer": answer,
            "sources": [
                {"product": chunk.product, "source": chunk.source}
                for chunk in top_chunks
            ],
            "used_context": bool(top_chunks),
        }


rag_service = RAGService()
