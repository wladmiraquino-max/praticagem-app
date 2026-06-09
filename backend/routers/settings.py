import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from auth import get_current_user

router = APIRouter(prefix="/api/settings", tags=["settings"])

ENV_PATH = Path(__file__).parent.parent / ".env"


class ApiKeyIn(BaseModel):
    api_key: str


def _read_env_vars() -> dict:
    if not ENV_PATH.exists():
        return {}
    result = {}
    for line in ENV_PATH.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        result[k.strip()] = v.strip()
    return result


def _write_env_vars(data: dict):
    lines = [f"{k}={v}" for k, v in data.items()]
    # Use utf-8 (without BOM) so Python can read the file cleanly on restart
    import io
    with io.open(str(ENV_PATH), "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(lines) + "\n")


@router.get("/ai-key")
def get_ai_key_status(_=Depends(get_current_user)):
    key = os.environ.get("ANTHROPIC_API_KEY", "").strip().strip('"').strip("'")
    configured = key.startswith("sk-ant-") and len(key) > 20
    return {
        "configured": configured,
        "prefix": (key[:12] + "...") if configured else "",
    }


@router.post("/ai-key")
def save_ai_key(data: ApiKeyIn, _=Depends(get_current_user)):
    key = data.api_key.strip().strip('"').strip("'")
    # Remove any non-ASCII characters that may have been accidentally pasted
    key = key.encode("ascii", errors="ignore").decode("ascii")
    if not key.startswith("sk-ant-") or len(key) < 20:
        raise HTTPException(
            status_code=400,
            detail="Chave inválida. Deve começar com 'sk-ant-'",
        )

    env_vars = _read_env_vars()
    env_vars["ANTHROPIC_API_KEY"] = key
    _write_env_vars(env_vars)

    os.environ["ANTHROPIC_API_KEY"] = key

    try:
        import anthropic
        import ai_service
        ai_service._api_key = key
        ai_service._ai_available = True
        ai_service.client = anthropic.Anthropic(api_key=key)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chave salva mas erro ao inicializar cliente IA: {e}",
        )

    return {"status": "ok", "message": "Chave Anthropic configurada com sucesso!"}
