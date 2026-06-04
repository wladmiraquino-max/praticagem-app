import os
import pdfplumber
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from auth import get_current_user
import models, schemas, ai_service

router = APIRouter(prefix="/api/materials", tags=["materials"])

UPLOAD_DIR = "uploads"


@router.get("", response_model=List[schemas.MaterialOut])
def list_materials(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Material).filter(models.Material.user_id == current_user.id).all()


@router.get("/{material_id}", response_model=schemas.MaterialOut)
def get_material(material_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    m = db.query(models.Material).filter(
        models.Material.id == material_id,
        models.Material.user_id == current_user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    return m


@router.post("/upload", response_model=schemas.MaterialOut)
async def upload_material(
    file: UploadFile = File(...),
    subject: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Extract text
    content = ""
    filename = file.filename or "material"
    if filename.lower().endswith(".pdf"):
        raw = await file.read()
        tmp_path = os.path.join(UPLOAD_DIR, f"tmp_{current_user.id}_{filename}")
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(tmp_path, "wb") as f:
            f.write(raw)
        with pdfplumber.open(tmp_path) as pdf:
            for page in pdf.pages[:30]:  # cap at 30 pages
                text = page.extract_text()
                if text:
                    content += text + "\n"
        os.remove(tmp_path)
    else:
        raw = await file.read()
        content = raw.decode("utf-8", errors="ignore")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Não foi possível extrair texto do arquivo")

    # AI processing
    title = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ").title()
    processed = ai_service.process_material(title, content, subject or "Praticagem")

    material = models.Material(
        user_id=current_user.id,
        title=title,
        subject=subject,
        source=filename,
        content=content[:10000],
        summary=processed.get("summary", ""),
        mnemonic=processed.get("mnemonic", ""),
        sections=processed.get("sections", []),
    )
    db.add(material)

    # Add knowledge nodes from concepts
    for concept in processed.get("concepts", [])[:10]:
        node = db.query(models.KnowledgeNode).filter(
            models.KnowledgeNode.user_id == current_user.id,
            models.KnowledgeNode.concept == concept,
        ).first()
        if not node:
            db.add(models.KnowledgeNode(
                user_id=current_user.id,
                concept=concept,
                subject=subject or "Geral",
                mastery=0,
            ))

    db.commit()
    db.refresh(material)
    return material


@router.post("/{material_id}/generate-questions")
def generate_questions(
    material_id: int,
    count: int = 5,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    m = db.query(models.Material).filter(
        models.Material.id == material_id,
        models.Material.user_id == current_user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Material não encontrado")

    questions_data = ai_service.generate_questions_from_content(m.content or "", m.subject or "Praticagem", count)
    created = []
    for qd in questions_data:
        q = models.Question(
            text=qd.get("text", ""),
            options=qd.get("options", {}),
            correct=qd.get("correct", "A"),
            explanation=qd.get("explanation", ""),
            subject=m.subject or "Geral",
            discipline="0",
            difficulty=qd.get("difficulty", "Médio"),
            source=qd.get("source", m.source),
        )
        db.add(q)
        created.append(q)
    db.commit()
    return {"created": len(created), "message": f"{len(created)} questões geradas com sucesso"}


@router.delete("/{material_id}")
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    m = db.query(models.Material).filter(
        models.Material.id == material_id,
        models.Material.user_id == current_user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    db.delete(m)
    db.commit()
    return {"ok": True}
