from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from auth import get_current_user
import models, schemas, ai_service
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/tutor", tags=["tutor"])


OFFICIAL_AGENTS = ["I", "II", "III", "IV", "V", "VI", "VII"]

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
    """HUB MASTER: roteia automaticamente ao agente oficial correto."""
    try:
        result = ai_service.hub_chat(
            message=payload.message,
            history=payload.history or [],
        )
        return result
    except Exception as e:
        _raise_ai_error(e)
