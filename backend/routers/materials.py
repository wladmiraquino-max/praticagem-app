import os
import re
import tempfile
import pdfplumber
import gdown
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
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
            for page in pdf.pages:
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


def _parse_drive_url(url: str) -> tuple[str, bool]:
    """Retorna (id, is_folder). Lança ValueError se URL inválida."""
    folder_match = re.search(r"/folders/([a-zA-Z0-9_-]+)", url)
    if folder_match:
        return folder_match.group(1), True
    for pat in [r"/file/d/([a-zA-Z0-9_-]+)", r"[?&]id=([a-zA-Z0-9_-]+)"]:
        m = re.search(pat, url)
        if m:
            return m.group(1), False
    raise ValueError("URL do Google Drive inválida. Use um link de compartilhamento de arquivo ou pasta.")


def _read_file_content(path: str) -> str:
    if path.lower().endswith(".pdf"):
        content = ""
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    content += text + "\n"
        return content
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def _save_material(db, user_id: int, filename: str, content: str, subject: str | None, source_prefix: str) -> models.Material:
    title = os.path.splitext(os.path.basename(filename))[0].replace("_", " ").replace("-", " ").title()
    processed = ai_service.process_material(title, content, subject or "Praticagem")
    material = models.Material(
        user_id=user_id,
        title=title,
        subject=subject,
        source=f"{source_prefix}:{filename}",
        content=content[:20000],
        summary=processed.get("summary", ""),
        mnemonic=processed.get("mnemonic", ""),
        sections=processed.get("sections", []),
    )
    db.add(material)
    for concept in processed.get("concepts", [])[:10]:
        node = db.query(models.KnowledgeNode).filter(
            models.KnowledgeNode.user_id == user_id,
            models.KnowledgeNode.concept == concept,
        ).first()
        if not node:
            db.add(models.KnowledgeNode(user_id=user_id, concept=concept, subject=subject or "Geral", mastery=0))
    return material


@router.post("/upload-drive")
async def upload_from_drive(
    drive_url: str = Body(..., embed=True),
    subject: Optional[str] = Body(None, embed=True),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        drive_id, is_folder = _parse_drive_url(drive_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    perm_hint = "Certifique-se de que está compartilhado como 'Qualquer pessoa com o link'."

    # ── PASTA ──────────────────────────────────────────────────────────────────
    if is_folder:
        tmp_dir = os.path.join(UPLOAD_DIR, f"folder_{current_user.id}_{drive_id}")
        try:
            gdown.download_folder(id=drive_id, output=tmp_dir, quiet=True, use_cookies=False)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erro ao baixar pasta: {str(e)}. {perm_hint}")

        exts = (".pdf", ".txt", ".md")
        files_found = []
        for root, _, fnames in os.walk(tmp_dir):
            for fname in fnames:
                if fname.lower().endswith(exts):
                    files_found.append(os.path.join(root, fname))

        if not files_found:
            import shutil; shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=400, detail="Nenhum arquivo PDF ou TXT encontrado na pasta.")

        created = 0
        errors = []
        for fpath in files_found:
            try:
                content = _read_file_content(fpath)
                if content.strip():
                    _save_material(db, current_user.id, fpath, content, subject, "google_drive_folder")
                    created += 1
            except Exception as ex:
                errors.append(os.path.basename(fpath))

        import shutil; shutil.rmtree(tmp_dir, ignore_errors=True)
        db.commit()

        msg = f"{created} material(is) processado(s) com sucesso."
        if errors:
            msg += f" {len(errors)} arquivo(s) ignorado(s): {', '.join(errors[:5])}"
        return {"created": created, "message": msg, "is_folder": True}

    # ── ARQUIVO ÚNICO ──────────────────────────────────────────────────────────
    tmp_path = os.path.join(UPLOAD_DIR, f"drive_{current_user.id}_{drive_id}.pdf")
    try:
        gdown.download(id=drive_id, output=tmp_path, quiet=True, fuzzy=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao baixar arquivo: {str(e)}. {perm_hint}")

    # Rejeitar arquivos muito grandes (>80MB) para não estourar memória no Render free
    if os.path.exists(tmp_path) and os.path.getsize(tmp_path) > 80 * 1024 * 1024:
        os.remove(tmp_path)
        raise HTTPException(status_code=400, detail="Arquivo muito grande (>80MB). Use a versão resumida/editada do PDF.")

    if not os.path.exists(tmp_path) or os.path.getsize(tmp_path) == 0:
        raise HTTPException(status_code=400, detail=f"Arquivo vazio ou não encontrado. {perm_hint}")

    try:
        content = _read_file_content(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Não foi possível ler o arquivo: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    if not content.strip():
        raise HTTPException(status_code=400, detail="Não foi possível extrair texto do arquivo.")

    material = _save_material(db, current_user.id, drive_id, content, subject, "google_drive")
    db.commit()
    db.refresh(material)
    return {"created": 1, "message": "Material processado com sucesso.", "is_folder": False, "material_id": material.id}


@router.post("/import")
def import_material(
    title: str = Body(..., embed=True),
    content: str = Body(..., embed=True),
    subject: Optional[str] = Body(None, embed=True),
    source: str = Body("google_drive_mcp", embed=True),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Importa material a partir de texto já extraído (usado pelo processamento via MCP)."""
    if not content.strip():
        raise HTTPException(status_code=400, detail="Conteúdo vazio")

    processed = ai_service.process_material(title, content, subject or "Praticagem")
    material = models.Material(
        user_id=current_user.id,
        title=title,
        subject=subject,
        source=source,
        content=content[:20000],
        summary=processed.get("summary", ""),
        mnemonic=processed.get("mnemonic", ""),
        sections=processed.get("sections", []),
    )
    db.add(material)
    for concept in processed.get("concepts", [])[:10]:
        node = db.query(models.KnowledgeNode).filter(
            models.KnowledgeNode.user_id == current_user.id,
            models.KnowledgeNode.concept == concept,
        ).first()
        if not node:
            db.add(models.KnowledgeNode(user_id=current_user.id, concept=concept, subject=subject or "Geral", mastery=0))
    db.commit()
    db.refresh(material)
    return {"id": material.id, "title": material.title, "message": "Material importado com sucesso"}


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
