import json
import re
from typing import Dict, List, Any

from app.agents.base import BaseAgent
from app.config import settings
from app.utils.llm_client import chat_completion

_CHROMA_AVAILABLE = False
_client = None
_embedder = None

try:
    import chromadb
    from chromadb.utils import embedding_functions
    _client = chromadb.PersistentClient(path=settings.chroma_dir)
    _embedder = embedding_functions.DefaultEmbeddingFunction()
    _CHROMA_AVAILABLE = True
except Exception as e:
    _CHROMA_AVAILABLE = False


SYSTEM_PROMPT = """You are MediMind AI, an expert specialized clinical healthcare & medical assistant.

CRITICAL INSTRUCTIONS & STRICT GUARDRAILS:
1. HEALTH SCOPE ONLY: You MUST ONLY discuss and answer questions related to health, medicine, medical conditions, symptoms, drugs/medications, lab reports, diagnostics, human biology, mental health, wellness, nutrition, anatomy, and healthcare.
2. NON-HEALTH TOPIC REJECTION: If the user asks about ANY non-health topic (such as programming, coding, movies, sports, politics, general technology, finance, cooking non-health recipes, gaming, etc.), REJECT IT IMMEDIATELY and politely respond with:
   "I am MediMind AI, your specialized healthcare assistant. I can only assist you with health, medical, wellness, and diagnostic queries. Please ask any health-related question!"
3. FREELY ANSWER HEALTH QUERIES: If the question is health-related, answer it freely, accurately, and thoroughly. If relevant patient health record excerpts are provided, use them to personalize your response. If no records exist, answer the general medical query directly with best clinical practices.
4. DISCLAIMER: Always maintain an empathetic, professional tone and include a subtle reminder that AI advice does not replace a licensed medical professional when appropriate."""


class RAGAgent(BaseAgent):
    name = "rag_agent"
    description = "Answers questions grounded in the patient's health history as well as general medical queries, enforcing strict health topic guardrails."

    def __init__(self):
        super().__init__()
        # In-memory fallback dictionary: user_id -> list of record dicts
        self._in_memory_records: Dict[int, List[Dict[str, Any]]] = {}

    def _collection(self, user_id: int):
        if _CHROMA_AVAILABLE and _client is not None:
            return _client.get_or_create_collection(
                name=f"user_{user_id}_records", embedding_function=_embedder
            )
        return None

    def add_record(self, user_id: int, record_id: str, text: str, metadata: dict):
        if _CHROMA_AVAILABLE and _client is not None:
            try:
                collection = self._collection(user_id)
                collection.upsert(ids=[record_id], documents=[text], metadatas=[metadata])
                return
            except Exception:
                pass
        
        # In-memory fallback
        if user_id not in self._in_memory_records:
            self._in_memory_records[user_id] = []
        
        # Replace if existing or append
        self._in_memory_records[user_id] = [
            r for r in self._in_memory_records[user_id] if r["id"] != record_id
        ]
        self._in_memory_records[user_id].append({
            "id": record_id,
            "text": text,
            "metadata": metadata
        })

    def run(self, user_id: int, question: str, n_results: int = 5) -> dict:
        context_str = ""
        metas = []

        if _CHROMA_AVAILABLE and _client is not None:
            try:
                collection = self._collection(user_id)
                count = collection.count()
                if count > 0:
                    results = collection.query(query_texts=[question], n_results=min(n_results, count))
                    docs = results.get("documents", [[]])[0]
                    metas = results.get("metadatas", [[]])[0]

                    context_str = "\n\n".join(
                        f"[{m.get('type', 'record')} on {m.get('date', 'unknown date')}] {d}"
                        for d, m in zip(docs, metas)
                    )
            except Exception:
                pass

        if not context_str:
            user_records = self._in_memory_records.get(user_id, [])
            if user_records:
                q_words = set(re.findall(r'\w+', question.lower()))
                scored = []
                for r in user_records:
                    r_words = set(re.findall(r'\w+', r["text"].lower()))
                    overlap = len(q_words.intersection(r_words))
                    scored.append((overlap, r))
                
                scored.sort(key=lambda x: x[0], reverse=True)
                top_records = [r for _, r in scored[:n_results]]
                context_str = "\n\n".join(
                    f"[{r['metadata'].get('type', 'record')} on {r['metadata'].get('date', 'unknown date')}] {r['text']}"
                    for r in top_records
                )
                metas = [r["metadata"] for r in top_records]

        if context_str:
            prompt = f"Patient Question: {question}\n\nPatient Relevant Health Record Excerpts:\n{context_str}"
        else:
            prompt = f"Patient Question: {question}\n\nPatient Health Records: No uploaded records found on file for this user yet."

        reply = chat_completion(SYSTEM_PROMPT, prompt)
        sources = [f"{m.get('type', 'record')} ({m.get('date', 'unknown date')})" for m in metas] if metas else []

        return {"reply": reply, "sources_used": sources}

