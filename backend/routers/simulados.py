from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/api/simulados", tags=["simulados"])


@router.get("", response_model=List[schemas.SimuladoOut])
def list_simulados(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    sims = db.query(models.Simulado).all()
    result = []
    for s in sims:
        result.append(schemas.SimuladoOut(
            id=s.id,
            title=s.title,
            description=s.description,
            question_count=len(s.question_ids or []),
            duration_minutes=s.duration_minutes,
        ))
    return result


@router.get("/{simulado_id}/questions")
def get_simulado_questions(
    simulado_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sim = db.query(models.Simulado).filter(models.Simulado.id == simulado_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulado não encontrado")

    questions = (
        db.query(models.Question)
        .filter(models.Question.id.in_(sim.question_ids))
        .all()
    )
    return [schemas.QuestionOut.model_validate(q) for q in questions]


@router.post("/{simulado_id}/submit", response_model=schemas.SimuladoResult)
def submit_simulado(
    simulado_id: int,
    payload: schemas.SimuladoSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sim = db.query(models.Simulado).filter(models.Simulado.id == simulado_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulado não encontrado")

    questions = {
        str(q.id): q
        for q in db.query(models.Question).filter(models.Question.id.in_(sim.question_ids)).all()
    }

    per_question = []
    correct_count = 0
    for qid, selected in payload.answers.items():
        q = questions.get(qid)
        if not q:
            continue
        is_correct = selected.upper() == q.correct.upper()
        if is_correct:
            correct_count += 1
        per_question.append({
            "question_id": int(qid),
            "text": q.text,
            "selected": selected,
            "correct": q.correct,
            "is_correct": is_correct,
            "explanation": q.explanation,
        })
        # Save individual answer
        db.add(models.UserAnswer(
            user_id=current_user.id,
            question_id=int(qid),
            selected=selected,
            is_correct=is_correct,
        ))

    total = len(per_question)
    score = (correct_count / total * 100) if total > 0 else 0

    session = models.SimuladoSession(
        user_id=current_user.id,
        simulado_id=simulado_id,
        answers=payload.answers,
        score=score,
        total=total,
    )
    db.add(session)
    db.commit()

    return schemas.SimuladoResult(
        score=score,
        total=total,
        correct=correct_count,
        per_question=per_question,
    )
