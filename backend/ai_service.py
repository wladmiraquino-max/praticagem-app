"""
Serviço de IA que integra os 14 agentes especialistas ao backend web.
Importa AGENT_PROMPTS do projeto praticagem_agents existente.
"""
import os
import json
import anthropic

from agents.prompts import AGENT_PROMPTS, AGENT_NAMES

MODEL = "claude-sonnet-4-6"
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SUBJECT_MAP = {
    "1": "Manobra",
    "2": "Arte Naval",
    "3": "Arquitetura Naval",
    "4": "Meteorologia e Oceanografia",
    "5": "Legislação Marítima",
    "6": "Navegação e Radar",
    "7": "Comunicações",
    "8": "Segurança da Navegação",
    "9": "Normas e Publicações",
    "10": "Gestão e Procedimentos",
    "11": "Sistemas e Equipamentos",
    "12": "Conhecimentos Portuários",
    "13": "Outros Assuntos",
    "14": "Conhecimentos Gerais",
}


def chat_with_agent(agent_id: str, message: str, history: list[dict]) -> str:
    """Conversa com um agente especialista específico."""
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


def generate_from_caderno(content: str, subject: str, count: int = 10) -> list[dict]:
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
