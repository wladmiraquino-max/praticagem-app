from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from database import get_db
from auth import get_current_user
import models, schemas
from datetime import datetime, timezone

router = APIRouter(prefix="/api/questions", tags=["questions"])


@router.get("", response_model=List[schemas.QuestionOut])
def list_questions(
    subject: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = Query(10, le=50),
    offset: int = 0,
    filter: Optional[str] = None,  # "wrong" | "favorites" | "review"
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.Question)
    if subject:
        q = q.filter(models.Question.subject == subject)
    if difficulty:
        q = q.filter(models.Question.difficulty == difficulty)

    if filter == "wrong":
        wrong_ids = (
            db.query(models.UserAnswer.question_id)
            .filter(models.UserAnswer.user_id == current_user.id, models.UserAnswer.is_correct == False)
            .subquery()
        )
        q = q.filter(models.Question.id.in_(wrong_ids))

    total = q.count()
    questions = q.offset(offset).limit(limit).all()
    return questions


@router.get("/count")
def count_questions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    total = db.query(models.Question).count()
    return {"total": total}


@router.get("/subjects")
def list_subjects(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    subjects = db.query(models.Question.subject).distinct().all()
    return [s[0] for s in subjects if s[0]]


@router.get("/{question_id}", response_model=schemas.QuestionOut)
def get_question(question_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Questão não encontrada")
    return q


@router.post("/{question_id}/answer", response_model=schemas.AnswerResult)
def answer_question(
    question_id: int,
    payload: schemas.AnswerSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Questão não encontrada")

    is_correct = payload.selected.upper() == question.correct.upper()
    answer = models.UserAnswer(
        user_id=current_user.id,
        question_id=question_id,
        selected=payload.selected,
        is_correct=is_correct,
    )
    db.add(answer)

    # Update knowledge node
    node = (
        db.query(models.KnowledgeNode)
        .filter(
            models.KnowledgeNode.user_id == current_user.id,
            models.KnowledgeNode.subject == question.subject,
        )
        .first()
    )
    if not node:
        node = models.KnowledgeNode(
            user_id=current_user.id,
            concept=question.subject,
            subject=question.subject,
        )
        db.add(node)

    node.seen_count = (node.seen_count or 0) + 1
    if is_correct:
        node.correct_count = (node.correct_count or 0) + 1
    node.mastery = (node.correct_count / node.seen_count) * 100
    node.last_seen = datetime.now(timezone.utc)
    db.commit()

    return schemas.AnswerResult(
        is_correct=is_correct,
        correct=question.correct,
        explanation=question.explanation,
    )
