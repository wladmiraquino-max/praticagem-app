import os
from pathlib import Path

# ── Carrega .env ANTES de qualquer outro import ──────────────────────────────
# ai_service lê ANTHROPIC_API_KEY no momento do import, então precisa
# estar no os.environ antes disso.
_env_file = Path(__file__).parent / ".env"
if _env_file.exists():
    for _line in _env_file.read_text(encoding="utf-8-sig").splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _, _v = _line.partition("=")
            os.environ.setdefault(_k.strip(), _v.strip())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import engine, Base
import models  # ensure all models are registered

from routers import auth, questions, simulados, materials, tutor, progress, trail, preferences, question_books, settings as settings_router, publications

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Praticagem Study API", version="1.0.0")

ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://localhost:8000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(simulados.router)
app.include_router(materials.router)
app.include_router(tutor.router)
app.include_router(progress.router)
app.include_router(trail.router)
app.include_router(preferences.router)
app.include_router(question_books.router)
app.include_router(settings_router.router)
app.include_router(publications.router)


@app.get("/health")
def health():
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    key_stripped = key.strip().strip('"').strip("'")
    key_ok = key_stripped.startswith("sk-ant-") and len(key_stripped) > 20
    return {
        "api": "online",
        "anthropic_key_set": key_ok,
        "key_prefix": key_stripped[:15] + "..." if len(key_stripped) > 5 else "EMPTY",
    }


# ── Servir o frontend React (build de producao) ──────────────────────────────
DIST = Path(__file__).parent.parent / "frontend" / "dist"

if DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(DIST / "assets")), name="assets")

    @app.get("/favicon.svg")
    def favicon():
        return FileResponse(str(DIST / "favicon.svg"))

    @app.get("/icons.svg")
    def icons():
        return FileResponse(str(DIST / "icons.svg"))

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        return FileResponse(str(DIST / "index.html"))
else:
    @app.get("/")
    def root():
        return {"status": "Praticagem API online", "docs": "/docs", "note": "frontend/dist nao encontrado — rode: cd frontend && npm run build"}
