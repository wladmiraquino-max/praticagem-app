"""
Serviço de IA que integra os 14 agentes especialistas ao backend web.
Importa AGENT_PROMPTS do projeto praticagem_agents existente.
"""
import os
import json
import anthropic

from agents.prompts import AGENT_PROMPTS, AGENT_NAMES

MODEL = "claude-sonnet-4-6"

_api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip().strip('"').strip("'")
_ai_available = _api_key.startswith("sk-ant-") and len(_api_key) > 20

try:
    client = anthropic.Anthropic(api_key=_api_key if _ai_available else "sk-ant-dummy")
except Exception:
    client = None


def _require_ai():
    if not _ai_available or client is None:
        raise RuntimeError("IA indisponivel: configure ANTHROPIC_API_KEY para usar funcionalidades de IA.")

SUBJECT_MAP = {
    # ── 7 seções oficiais Anexo 2-B ───────────────────────────────────────────
    "I":   "Manobrabilidade do Navio",
    "II":  "Arte Naval e Shiphandling",
    "III": "Navegação em Águas Restritas",
    "IV":  "Legislação e Regulamentação",
    "V":   "Meteorologia, Oceanografia e Navegação",
    "VI":  "Comunicações",
    "VII": "Conhecimentos Gerais",
    # ── mapeamento de compatibilidade (agentes legados → seção oficial) ───────
    "1":  "Arte Naval e Shiphandling",
    "2":  "Comunicações",
    "3":  "Legislação e Regulamentação",
    "4":  "Meteorologia, Oceanografia e Navegação",
    "5":  "Navegação em Águas Restritas",
    "6":  "Navegação em Águas Restritas",
    "7":  "Arte Naval e Shiphandling",
    "8":  "Manobrabilidade do Navio",
    "9":  "Manobrabilidade do Navio",
    "10": "Arte Naval e Shiphandling",
    "11": "Navegação em Águas Restritas",
    "12": "Arte Naval e Shiphandling",
    "13": "Conhecimentos Gerais",
    "14": "Conhecimentos Gerais",
}


def chat_with_agent(agent_id: str, message: str, history: list[dict]) -> str:
    """Conversa com um agente especialista específico."""
    _require_ai()
    system_prompt = AGENT_PROMPTS.get(agent_id, AGENT_PROMPTS.get("orchestrator", ""))
    system = [{"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}]

    messages = list(history) + [{"role": "user", "content": message}]
    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=system,
        messages=messages,
    )
    return response.content[-1].text


def generate_questions_from_content(content: str, subject: str, count: int = 5) -> list[dict]:
    _require_ai()
    """Gera questões de múltipla escolha a partir de um texto."""
    prompt = f"""Com base no seguinte conteúdo sobre {subject}, crie {count} questões de múltipla escolha no estilo do concurso de Praticagem brasileiro.

CONTEÚDO:
{content[:3000]}

Retorne APENAS um JSON válido com esta estrutura (sem markdown, sem explicação extra):
[
  {{
    "text": "enunciado da questão",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
    "correct": "A",
    "explanation": "justificativa da resposta correta",
    "difficulty": "Fácil|Médio|Difícil",
    "source": "referência bibliográfica"
  }}
]"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[-1].text.strip()
    # Remove markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text)
    except Exception:
        return []


def process_material(title: str, content: str, subject: str) -> dict:
    _require_ai()
    """Processa um material de estudo: gera resumo, mnemônico e seções."""
    prompt = f"""Você é um especialista no concurso de Praticagem brasileiro.
Analise o seguinte material sobre "{title}" ({subject}) e retorne APENAS um JSON válido (sem markdown):

{{
  "summary": "resumo executivo de 3-5 parágrafos focado nos pontos mais cobrados no concurso",
  "mnemonic": "mnemônico criativo e fácil de memorizar para os pontos principais",
  "sections": [
    {{
      "title": "título da seção",
      "content": "conteúdo condensado",
      "key_points": ["ponto chave 1", "ponto chave 2", "ponto chave 3"]
    }}
  ],
  "concepts": ["conceito1", "conceito2", "conceito3"]
}}

MATERIAL:
{content[:4000]}"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[-1].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text)
    except Exception:
        return {"summary": text[:500], "mnemonic": "", "sections": [], "concepts": []}


def generate_study_trail(stats: dict, preferences: dict) -> list[dict]:
    _require_ai()
    """Gera trilha de estudos personalizada de 4 semanas."""
    prompt = f"""Você é um especialista em preparação para o concurso de Praticagem brasileiro.
Com base no desempenho e preferências do candidato, crie um plano de estudos de 4 semanas.

DESEMPENHO POR MATÉRIA:
{json.dumps(stats.get("by_subject", []), ensure_ascii=False, indent=2)}

PREFERÊNCIAS:
- Horas por dia: {preferences.get("daily_hours", 2)}h
- Data da prova: {preferences.get("exam_date", "10/11/2027")}
- Volume de sessão: {preferences.get("session_volume", "Médio")}
- Notas pessoais: {preferences.get("notes", "")}

Retorne APENAS um JSON válido com esta estrutura:
[
  {{
    "sprint": "S1",
    "title": "título do sprint",
    "description": "objetivo do sprint",
    "subjects": ["Matéria1", "Matéria2"],
    "daily_goal": "X questões por dia",
    "tasks": ["tarefa 1 detalhada", "tarefa 2 detalhada", "tarefa 3 detalhada"]
  }}
]
Crie 4 sprints semanais."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=3000,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[-1].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text)
    except Exception:
        return []


def _call_extract_questions(chunk: str) -> list[dict]:
    """Faz uma chamada à IA para extrair questões de um chunk de conteúdo."""
    prompt = f"""Você é um assistente especializado em extrair questões de concurso de cadernos de estudo.

Analise o CADERNO DE QUESTÕES abaixo e extraia TODAS as questões exatamente como estão escritas, preservando:
- O enunciado original da questão
- As alternativas originais (podem ser A/B/C/D/E maiúsculas ou a/b/c/d/e minúsculas ou (a)(b)(c)(d)(e))
- A resposta correta (normalize sempre para letra maiúscula: A, B, C, D ou E)
- O gabarito comentado/justificativa original (exatamente como está no caderno)

IMPORTANTE: Não crie nem modifique nada. Extraia fielmente o que está escrito.
Se o texto tiver caracteres corrompidos (OCR ou encoding ruim), use o contexto para inferir.

CADERNO:
{chunk}

Retorne APENAS um JSON válido (sem markdown), com esta estrutura:
[
  {{
    "text": "enunciado exato da questão",
    "options": {{"A": "texto da alternativa A", "B": "...", "C": "...", "D": "...", "E": "..."}},
    "correct": "letra maiúscula da alternativa correta (A/B/C/D/E)",
    "explanation": "gabarito comentado original completo",
    "difficulty": "Médio",
    "source": "BZ Praticagem"
  }}
]

Se alguma questão não tiver todas as alternativas ou gabarito, inclua o que estiver disponível.
Se não encontrar nenhuma questão neste trecho, retorne []."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[-1].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text)
    except Exception:
        return []


def extract_questions_from_caderno(content: str, subject: str) -> list[dict]:
    _require_ai()
    """Extrai as questões EXATAS de um caderno BZ com gabarito comentado original.
    Para arquivos grandes, processa em chunks de 20k chars com deduplicação."""
    CHUNK_SIZE = 20000
    OVERLAP = 800

    if len(content) <= CHUNK_SIZE:
        return _call_extract_questions(content)

    # Arquivo grande: divide em chunks e deduplica por texto de questão
    all_questions = []
    seen_texts = set()
    start = 0
    while start < len(content):
        end = min(start + CHUNK_SIZE, len(content))
        chunk = content[start:end]
        chunk_results = _call_extract_questions(chunk)
        for q in chunk_results:
            key = (q.get("text", "") or "")[:80].strip()
            if key and key not in seen_texts:
                seen_texts.add(key)
                all_questions.append(q)
        if end >= len(content):
            break
        start = end - OVERLAP  # sobreposição para não perder questões na fronteira

    return all_questions


def generate_from_caderno(content: str, subject: str, count: int = 10) -> list[dict]:
    _require_ai()
    """Gera novas questões de múltipla escolha com base em caderno de questões com gabarito comentado."""
    prompt = f"""Você é um especialista em elaboração de questões para o concurso de Praticagem brasileiro.

Analise o CADERNO DE QUESTÕES abaixo (que contém questões resolvidas com gabarito comentado) e gere {count} NOVAS questões originais de múltipla escolha, no mesmo estilo e nível de dificuldade.

INSTRUÇÕES:
- As novas questões devem cobrir os mesmos temas e normas identificados no caderno
- Use o mesmo padrão de enunciado do concurso (citando resolução IMO, artigo de lei, etc.)
- Inclua as mesmas "pegadinhas" e detalhes que costumam aparecer nas provas
- Crie questões que NÃO estejam no caderno (questões originais)
- Justifique cada gabarito com o trecho exato da norma

CADERNO:
{content[:5000]}

Retorne APENAS um JSON válido (sem markdown), com esta estrutura:
[
  {{
    "text": "enunciado completo da questão",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}},
    "correct": "A",
    "explanation": "justificativa detalhada com trecho da norma",
    "difficulty": "Fácil|Médio|Difícil",
    "source": "Resolução/Lei citada"
  }}
]"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[-1].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text)
    except Exception:
        return []


def generate_daily_briefing(stats: dict, user_name: str) -> str:
    """Gera briefing diário personalizado."""
    days_to_exam = 525
    prompt = f"""Crie um briefing de estudo de 3-4 frases para {user_name} que está se preparando para o concurso de Praticagem.
Dados: {days_to_exam} dias até a prova, {stats.get("total_answered", 0)} questões respondidas, {stats.get("accuracy", 0)*100:.0f}% de acerto.
Pontos fracos: {[s["subject"] for s in stats.get("by_subject", []) if s.get("accuracy", 1) < 0.7][:3]}.
Seja direto, motivador e específico sobre o que estudar hoje."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[-1].text
