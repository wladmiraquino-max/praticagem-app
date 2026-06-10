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


# ─── Palavras-chave por agente para busca automática de publicações ────────────
AGENT_PUB_KEYWORDS: dict[str, list[str]] = {
    "I":   ["manobra", "shiphandling", "manobrabilidade", "squat"],
    "II":  ["arte naval", "naval", "estabilidade", "trim", "rebocador"],
    "III": ["navegação", "radar", "ecdis", "navegacao", "arpa"],
    "IV":  ["legislação", "normam", "ripeam", "legislacao", "regulamentação"],
    "V":   ["meteorologia", "oceanografia", "tempo", "vento"],
    "VI":  ["comunicação", "gmdss", "vhf", "comunicacao", "rádio"],
    "VII": ["conhecimentos gerais", "brm", "marpol", "ism", "stcw"],
}

# ─── Camada de governança injetada em todo prompt governado ───────────────────
GOVERNANCE_LAYER = """

═══════════════════════════════════════════════════════════
CAMADA DE GOVERNANÇA — HUB ADMINISTRADOR PSCPP
═══════════════════════════════════════════════════════════

REGRA SUPREMA:
NUNCA INVENTE. NUNCA COMPLETE LACUNAS COM CONHECIMENTO PRÓPRIO.
Se a informação não estiver (a) nas Referências Primárias deste agente
ou (b) nos Documentos Adicionais abaixo, responda exatamente:
"Informação não localizada claramente na bibliografia oficial do PSCPP."

HIERARQUIA DE AUTORIDADE:
1. Conteúdo Programático do Edital PSCPP
2. Referências Primárias declaradas neste prompt
3. Documentos Adicionais injetados abaixo (quando presentes)
4. Resoluções IMO (MSC, A., FAL.) / SOLAS / COLREG / RIPEAM
5. NORMAM / Legislação Federal Brasileira

AUDITORIA INTERNA — execute ANTES de cada resposta:
① O conteúdo técnico está nas Referências Primárias declaradas?
② Todos os números, distâncias, pesos e procedimentos têm origem comprovada?
③ Não houve extrapolação além do que a fonte sustenta?
④ A resposta está alinhada ao Anexo 2-B do edital?
Se qualquer resposta for NÃO → aplicar REGRA SUPREMA acima.

REGRA DE PARCIALIDADE:
Se parte da resposta for comprovada e parte não:
- Responda apenas a parte comprovada
- Indique: "Informação parcial — [detalhe] não localizado na bibliografia disponível."

FORMATO OBRIGATÓRIO DE RESPOSTA:
[Conteúdo técnico completo dentro do que a bibliografia suporta]

**Referência:** [Obra — Cap./Seção] ou "Não localizado na bibliografia disponível"
**Status de Auditoria:** VALIDADO | PARCIAL | RECUSADO
"""

# ─── Prompt do Auditor Externo (Fase 2 — chamada separada, ainda não ativa) ───
AUDITOR_PROMPT = """Você é o AGENTE AUDITOR do HUB PSCPP. Verifica respostas do especialista.

PERGUNTA ORIGINAL: {question}
ESPECIALISTA: {agent_name}
RESPOSTA DO ESPECIALISTA: {specialist_response}
CONTEXTO BIBLIOGRÁFICO DISPONÍVEL: {pub_context}

VERIFICAÇÕES:
1. A resposta cita publicação rastreável? (sim/não)
2. Números/dados técnicos confirmados no contexto? (sim/não/na)
3. Houve extrapolação? (sim/não)
4. Capítulo/seção identificável? (sim/não)
5. Alinhamento ao Anexo 2-B? (sim/não)

REGRA: se pub_context vazio, não bloqueie automaticamente — avalie rastreabilidade ao edital.
REGRA: números específicos sem confirmação no contexto → REVISAR.
REGRA: após 2 ciclos sem VALIDADO → BLOQUEADO com frase oficial de recusa.

Retorne SOMENTE JSON válido:
{{"verdict":"VALIDADO","notes":"razão","citation_found":true,"extrapolation_detected":false,"revision_instruction":""}}"""


HUB_ROUTER_PROMPT = """Você é o Roteador do HUB ADMINISTRADOR PSCPP. Analise a pergunta e identifique qual dos 7 agentes oficiais deve responder.

AGENTES OFICIAIS:
I   — Manobrabilidade do Navio (squat, UKC, pivot point, efeito de banco, interação entre navios, hidrodinâmica, fundo, canais)
II  — Arte Naval e Shiphandling (arquitetura naval, estabilidade, trim, hélice, leme, deflexão, atracação, rebocadores, linhas)
III — Navegação em Águas Restritas (carta náutica, radar, ECDIS, ARPA, GPS, AIS, pilotagem, ancoragem, correntes, marés, CPA, TCPA)
IV  — Legislação e Regulamentação (RIPEAM, CIRM, NORMAM, Lei da Praticagem, Direito Marítimo, SOLAS, STCW, COLREG)
V   — Meteorologia, Oceanografia e Navegação (meteorologia, previsão de tempo, oceanografia, ondas, correntes oceânicas)
VI  — Comunicações (SMSSM, GMDSS, VHF, DSC, NAVTEX, MF/HF, radiotelefonia, publicações náuticas, avisos aos navegantes)
VII — Conhecimentos Gerais (BRM, fatores humanos, liderança, MARPOL, segurança, ISPS, portos brasileiros, história da praticagem)

Retorne SOMENTE um JSON válido, sem markdown, sem explicação extra:
{"agent_id": "I", "rationale": "motivo em uma frase curta"}"""


def route_question(message: str) -> dict:
    """Identifica qual agente oficial deve responder a pergunta (roteamento HUB)."""
    _require_ai()
    response = client.messages.create(
        model=MODEL,
        max_tokens=120,
        system=HUB_ROUTER_PROMPT,
        messages=[{"role": "user", "content": message}],
    )
    text = response.content[-1].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        data = json.loads(text)
        if data.get("agent_id") not in ["I", "II", "III", "IV", "V", "VI", "VII"]:
            data["agent_id"] = "I"
        return data
    except Exception:
        return {"agent_id": "I", "rationale": "roteamento padrão"}


def hub_chat(message: str, history: list[dict]) -> dict:
    """HUB MASTER legado: mantido para compatibilidade interna. Use hub_chat_governed via /tutor/hub."""
    route = route_question(message)
    agent_id = route.get("agent_id", "I")
    response_text = chat_with_agent(agent_id=agent_id, message=message, history=history)
    return {
        "agent_id": agent_id,
        "agent_name": AGENT_NAMES.get(agent_id, agent_id),
        "subject": SUBJECT_MAP.get(agent_id, agent_id),
        "response": response_text,
        "routed_by": "HUB",
        "rationale": route.get("rationale", ""),
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


def chat_with_agent_governed(
    agent_id: str,
    message: str,
    history: list[dict],
    pub_context: str = "",
) -> str:
    """Agente com camada de governança + contexto bibliográfico injetado.
    Usa o prompt original do agente como base e acrescenta as regras de auditoria.
    """
    _require_ai()
    base_prompt = AGENT_PROMPTS.get(agent_id, AGENT_PROMPTS.get("orchestrator", ""))

    docs_section = ""
    if pub_context:
        docs_section = f"\n\n═══ DOCUMENTOS ADICIONAIS (recuperados automaticamente) ═══\n{pub_context}\n═══ FIM DOS DOCUMENTOS ═══"

    full_system = base_prompt + GOVERNANCE_LAYER + docs_section
    system = [{"type": "text", "text": full_system, "cache_control": {"type": "ephemeral"}}]

    messages = list(history) + [{"role": "user", "content": message}]
    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=system,
        messages=messages,
    )
    return response.content[-1].text


def hub_chat_governed(
    agent_id: str,
    route: dict,
    message: str,
    history: list[dict],
    pub_context: str = "",
) -> dict:
    """HUB MASTER governado: usa o agente especialista com camada de governança
    e contexto bibliográfico injetado automaticamente pelo roteador.
    Substitui hub_chat() para toda comunicação via /tutor/hub.
    """
    response_text = chat_with_agent_governed(
        agent_id=agent_id,
        message=message,
        history=history,
        pub_context=pub_context,
    )
    audit_status = "VALIDADO"
    if "RECUSADO" in response_text.upper() or "não localizada claramente" in response_text.lower():
        audit_status = "RECUSADO"
    elif "PARCIAL" in response_text.upper() or "parcial" in response_text.lower():
        audit_status = "PARCIAL"

    return {
        "agent_id": agent_id,
        "agent_name": AGENT_NAMES.get(agent_id, agent_id),
        "subject": SUBJECT_MAP.get(agent_id, agent_id),
        "response": response_text,
        "routed_by": "HUB",
        "rationale": route.get("rationale", ""),
        "audit_status": audit_status,
        "pub_context_used": bool(pub_context),
    }


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
        start = end - OVERLAP

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
