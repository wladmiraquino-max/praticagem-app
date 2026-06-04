from fastapi import APIRouter, Depends
from database import get_db
from auth import get_current_user
import models, schemas, ai_service
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/tutor", tags=["tutor"])


@router.get("/agents")
def list_agents(current_user: models.User = Depends(get_current_user)):
    agents = []
    for key, name in ai_service.AGENT_NAMES.items():
        if key == "orchestrator" or not key.isdigit():
            continue
        agents.append({
            "id": key,
            "name": name,
            "subject": ai_service.SUBJECT_MAP.get(key, name),
        })
    return agents


@router.post("/chat")
def chat(
    payload: schemas.TutorMessage,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from fastapi import HTTPException
    try:
        response = ai_service.chat_with_agent(
            agent_id=payload.agent_id,
            message=payload.message,
            history=payload.history or [],
        )
        return {"response": response, "agent_id": payload.agent_id}
    except Exception as e:
        err = str(e)
        if "api_key" in err.lower() or "authentication" in err.lower():
            raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY inválida ou não configurada no servidor.")
        if "credit" in err.lower() or "billing" in err.lower() or "quota" in err.lower():
            raise HTTPException(status_code=503, detail="Saldo insuficiente na conta Anthropic. Adicione créditos em console.anthropic.com")
        raise HTTPException(status_code=500, detail=f"Erro IA: {err[:300]}")
