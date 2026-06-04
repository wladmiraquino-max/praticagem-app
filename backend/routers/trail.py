from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from database import get_db
from auth import get_current_user
import models, ai_service
from routers.progress import _build_stats

router = APIRouter(prefix="/api/trail", tags=["trail"])


@router.get("")
def get_trail(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    trail = (
        db.query(models.StudyTrail)
        .filter(models.StudyTrail.user_id == current_user.id)
        .order_by(models.StudyTrail.generated_at.desc())
        .first()
    )
    if trail:
        return {
            "sprints": trail.content,
            "generated_at": trail.generated_at,
            "next_at": trail.next_at,
        }
    return {"sprints": [], "generated_at": None, "next_at": None}


@router.post("/generate")
def generate_trail(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    stats = _build_stats(current_user.id, db)
    prefs = db.query(models.Preferences).filter(models.Preferences.user_id == current_user.id).first()
    prefs_dict = {}
    if prefs:
        prefs_dict = {
            "daily_hours": prefs.daily_hours,
            "exam_date": prefs.exam_date,
            "session_volume": prefs.session_volume,
            "notes": prefs.notes,
        }

    sprints = ai_service.generate_study_trail(stats, prefs_dict)
    next_at = datetime.now(timezone.utc) + timedelta(days=7)

    trail = models.StudyTrail(
        user_id=current_user.id,
        content=sprints,
        next_at=next_at,
    )
    db.add(trail)
    db.commit()

    return {"sprints": sprints, "generated_at": trail.generated_at, "next_at": next_at}
