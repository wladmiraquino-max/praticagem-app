from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/api/preferences", tags=["preferences"])


@router.get("", response_model=schemas.PreferencesOut)
def get_preferences(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    prefs = db.query(models.Preferences).filter(models.Preferences.user_id == current_user.id).first()
    if not prefs:
        prefs = models.Preferences(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs


@router.put("", response_model=schemas.PreferencesOut)
def update_preferences(
    data: schemas.PreferencesIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    prefs = db.query(models.Preferences).filter(models.Preferences.user_id == current_user.id).first()
    if not prefs:
        prefs = models.Preferences(user_id=current_user.id)
        db.add(prefs)

    for field, value in data.model_dump().items():
        setattr(prefs, field, value)

    db.commit()
    db.refresh(prefs)
    return prefs
