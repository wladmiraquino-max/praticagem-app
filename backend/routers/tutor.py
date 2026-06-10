from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from database import get_db
from auth import get_current_user
import models, schemas, ai_service
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/tutor", tags=["tutor"])


OFFICIAL_AGENTS = ["I", "II", "III", "IV", "V", "VI", "VII"]


def _fetch_pub_context(agent_id: str, db: Session) -> str:
    """Busca publicações relevantes para o agente e retorna texto formatado para injeção."""
    keywords = ai_service.AGENT_PUB_KEYWORDS.get(agent_id, [])
    if not keywords:
        return ""
    filters = []
    for kw in keywords[:3]:
        filters.append(models.Publication.category.ilike(f"%{kw}%"))
        filters.append(models.Publication.title.ilike(f"%{kw}%"))
    pubs = db.query(models.Publication).filter(or_(*filters)).limit(3).all()
    if not pubs:
        return ""
    return "\n\n---\n\n".join(
        f"[{p.category} — {p.title}]\n{(p.content or '')[:3000]}"
        for p in pubs
    )


@router.get("/agents")
def list_agents(current_user: models.User = Depends(get_current_user)):
    agents = []
    for key in OFFICIAL_AGENTS:
        name = ai_service.AGENT_NAMES.get(key, key)
        agents.append({
            "id": key,
            "name": name,
            "subject": ai_service.SUBJECT_MAP.get(key, name),
        })
    return agents


def _raise_ai_error(e: Exception):
    err = str(e)
    if "api_key" in err.lower() or "authentication" in err.lower():
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY inválida ou não configurada no servidor.")
    if "credit" in err.lower() or "billing" in err.lower() or "quota" in err.lower():
        raise HTTPException(status_code=503, detail="Saldo insuficiente na conta Anthropic. Adicione créditos em console.anthropic.com")
    raise HTTPException(status_code=500, detail=f"Erro IA: {err[:300]}")


@router.post("/chat")
def chat(
    payload: schemas.TutorMessage,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        response = ai_service.chat_with_agent(
            agent_id=payload.agent_id,
            message=payload.message,
            history=payload.history or [],
        )
        return {"response": response, "agent_id": payload.agent_id}
    except Exception as e:
        _raise_ai_error(e)


@router.post("/hub")
def hub_chat(
    payload: schemas.TutorHubMessage,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """HUB MASTER governado: roteia ao agente correto, injeta publicações
    relevantes automaticamente e aplica camada de governança bibliográfica."""
    try:
        route = ai_service.route_question(payload.message)
        agent_id = route.get("agent_id", "I")
        pub_context = _fetch_pub_context(agent_id, db)
        result = ai_service.hub_chat_governed(
            agent_id=agent_id,
            route=route,
            message=payload.message,
            history=payload.history or [],
            pub_context=pub_context,
        )
        return result
    except Exception as e:
        _raise_ai_error(e)
