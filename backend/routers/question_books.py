import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from auth import get_current_user
import models, schemas, ai_service
from pdf_utils import extract_text

router = APIRouter(prefix="/api/question-books", tags=["question-books"])

UPLOAD_DIR = "uploads"


@router.get("", response_model=List[schemas.QuestionBookOut])
def list_books(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.QuestionBook).filter(models.QuestionBook.user_id == current_user.id).order_by(models.QuestionBook.created_at.desc()).all()


@router.post("/upload", response_model=schemas.QuestionBookOut)
async def upload_book(
    file: UploadFile = File(...),
    subject: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    MAX_SIZE = 15 * 1024 * 1024  # 15 MB
    filename = file.filename or "caderno"
    content = ""

    raw = await file.read()
    if len(raw) > MAX_SIZE:
        raise HTTPException(status_code=400, detail=f"Arquivo muito grande ({len(raw)//1024//1024}MB). Limite: 15MB.")

    content, error = extract_text(raw, filename, max_pages=60)
    if error:
        raise HTTPException(status_code=400, detail=error)

    title = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ").title()

    book = models.QuestionBook(
        user_id=current_user.id,
        title=title,
        subject=subject,
        source_filename=filename,
        content=content[:30000],
        questions_generated=0,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.post("/{book_id}/generate")
def generate_questions(
    book_id: int,
    count: int = 10,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    book = db.query(models.QuestionBook).filter(
        models.QuestionBook.id == book_id,
        models.QuestionBook.user_id == current_user.id,
    ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Caderno não encontrado")

    if not (book.content or "").strip():
        raise HTTPException(status_code=400, detail="Este caderno não tem conteúdo extraído. Envie novamente o arquivo em formato TXT ou DOCX.")

    try:
        questions_data = ai_service.generate_from_caderno(
            content=book.content or "",
            subject=book.subject or "Praticagem",
            count=count,
        )
    except Exception as e:
        err = str(e)
        if "api_key" in err.lower() or "authentication" in err.lower() or "auth" in err.lower():
            raise HTTPException(status_code=503, detail="Chave da IA não configurada no servidor. Configure ANTHROPIC_API_KEY no Render.")
        raise HTTPException(status_code=500, detail=f"Erro ao chamar a IA: {err[:200]}")

    created = 0
    for qd in questions_data:
        if not qd.get("text"):
            continue
        q = models.Question(
            text=qd.get("text", ""),
            options=qd.get("options", {"A": "", "B": "", "C": "", "D": ""}),
            correct=qd.get("correct", "A"),
            explanation=qd.get("explanation", ""),
            subject=book.subject or "Geral",
            discipline="0",
            difficulty=qd.get("difficulty", "Médio"),
            source=f"[caderno:{book.id}] {book.title}",
        )
        db.add(q)
        created += 1

    book.questions_generated = (book.questions_generated or 0) + created
    db.commit()

    return {
        "created": created,
        "message": f"{created} questões geradas com sucesso a partir do caderno.",
        "total_generated": book.questions_generated,
    }


@router.post("/{book_id}/extract")
def extract_exact_questions(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Extrai questões EXATAS do caderno BZ com gabarito comentado original."""
    book = db.query(models.QuestionBook).filter(
        models.QuestionBook.id == book_id,
        models.QuestionBook.user_id == current_user.id,
    ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Caderno não encontrado")

    if not (book.content or "").strip():
        raise HTTPException(status_code=400, detail="Caderno sem conteúdo extraído.")

    try:
        questions_data = ai_service.extract_questions_from_caderno(
            content=book.content or "",
            subject=book.subject or "Praticagem",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao extrair questões: {str(e)[:200]}")

    if not questions_data:
        raise HTTPException(status_code=400, detail="Não foi possível extrair questões. Verifique se o caderno tem questões com gabarito comentado.")

    created = 0
    for qd in questions_data:
        if not qd.get("text"):
            continue
        options = qd.get("options", {})
        if isinstance(options, dict) and len(options) < 2:
            continue
        q = models.Question(
            text=qd.get("text", ""),
            options=options,
            correct=qd.get("correct", "A"),
            explanation=qd.get("explanation", ""),
            subject=book.subject or "Arte Naval",
            discipline="0",
            difficulty=qd.get("difficulty", "Médio"),
            source=f"[caderno:{book.id}] " + qd.get("source", f"BZ — {book.title}"),
        )
        db.add(q)
        created += 1

    book.questions_generated = (book.questions_generated or 0) + created
    db.commit()

    return {
        "created": created,
        "message": f"{created} questões extraídas e salvas com gabarito comentado original.",
        "total_generated": book.questions_generated,
    }


@router.get("/{book_id}/questions", response_model=List[schemas.QuestionWithAnswer])
def get_book_questions(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Retorna todas as questões salvas de um caderno com gabarito comentado."""
    book = db.query(models.QuestionBook).filter(
        models.QuestionBook.id == book_id,
        models.QuestionBook.user_id == current_user.id,
    ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Caderno não encontrado")

    questions = db.query(models.Question).filter(
        models.Question.source.like(f"[caderno:{book.id}]%")
    ).all()
    return questions


@router.delete("/{book_id}")
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    book = db.query(models.QuestionBook).filter(
        models.QuestionBook.id == book_id,
        models.QuestionBook.user_id == current_user.id,
    ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Caderno não encontrado")
    db.delete(book)
    db.commit()
    return {"ok": True}
