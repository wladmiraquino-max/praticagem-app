import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # ensure all models are registered

from routers import auth, questions, simulados, materials, tutor, progress, trail, preferences, question_books

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Praticagem Study API", version="1.0.0")

ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
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


@app.get("/")
def root():
    return {"status": "Praticagem API online", "docs": "/docs"}


@app.get("/health")
def health():
    import os
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    key_stripped = key.strip().strip('"').strip("'")
    key_ok = key_stripped.startswith("sk-ant-") and len(key_stripped) > 20
    return {
        "api": "online",
        "anthropic_key_set": key_ok,
        "key_length": len(key),
        "key_prefix": key_stripped[:15] + "..." if len(key_stripped) > 5 else "EMPTY",
        "all_env_keys": [k for k in os.environ.keys() if "ANTHROP" in k.upper()],
    }
