from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from database import get_db
from auth import get_current_user
import models, schemas, ai_service

router = APIRouter(prefix="/api/progress", tags=["progress"])


def _build_stats(user_id: int, db: Session) -> dict:
    answers = db.query(models.UserAnswer).filter(models.UserAnswer.user_id == user_id).all()
    total = len(answers)
    correct = sum(1 for a in answers if a.is_correct)
    accuracy = correct / total if total > 0 else 0

    # Streak: consecutive days with at least one answer
    from collections import Counter
    days = Counter(a.answered_at.date() for a in answers if a.answered_at)
    streak = 0
    today = datetime.now(timezone.utc).date()
    check = today
    while check in days:
        streak += 1
        check -= timedelta(days=1)

    # By subject
    by_subject_map = defaultdict(lambda: {"total": 0, "correct": 0})
    for a in answers:
        if a.question and a.question.subject:
            by_subject_map[a.question.subject]["total"] += 1
            if a.is_correct:
                by_subject_map[a.question.subject]["correct"] += 1

    by_subject = [
        {
            "subject": subj,
            "total": data["total"],
            "correct": data["correct"],
            "accuracy": data["correct"] / data["total"] if data["total"] > 0 else 0,
        }
        for subj, data in by_subject_map.items()
    ]
    by_subject.sort(key=lambda x: x["accuracy"])

    # Recent activity (last 30 days)
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    recent = defaultdict(lambda: {"total": 0, "correct": 0})
    for a in answers:
        if a.answered_at and a.answered_at.replace(tzinfo=timezone.utc) >= cutoff:
            day = a.answered_at.strftime("%Y-%m-%d")
            recent[day]["total"] += 1
            if a.is_correct:
                recent[day]["correct"] += 1

    recent_activity = [{"date": d, **v} for d, v in sorted(recent.items())]

    return {
        "total_answered": total,
        "correct": correct,
        "accuracy": accuracy,
        "streak": streak,
        "by_subject": by_subject,
        "recent_activity": recent_activity,
    }


@router.get("/stats", response_model=schemas.ProgressStats)
def get_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return _build_stats(current_user.id, db)


@router.get("/briefing")
def get_briefing(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    stats = _build_stats(current_user.id, db)
    text = ai_service.generate_daily_briefing(stats, current_user.name)
    return {"briefing": text}


@router.get("/knowledge", response_model=list)
def get_knowledge(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    nodes = db.query(models.KnowledgeNode).filter(models.KnowledgeNode.user_id == current_user.id).all()
    by_subject = defaultdict(list)
    for n in nodes:
        by_subject[n.subject or "Geral"].append({
            "concept": n.concept,
            "mastery": n.mastery,
            "seen_count": n.seen_count,
            "correct_count": n.correct_count,
        })

    return [
        {
            "subject": subj,
            "mastery": sum(c["mastery"] for c in concepts) / len(concepts) if concepts else 0,
            "concept_count": len(concepts),
            "concepts": concepts,
        }
        for subj, concepts in by_subject.items()
    ]
