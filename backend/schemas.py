from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    class Config:
        from_attributes = True


# ── Questions ─────────────────────────────────────────────────────────────────
class QuestionOut(BaseModel):
    id: int
    text: str
    options: Dict[str, str]
    subject: str
    discipline: str
    difficulty: str
    source: Optional[str] = None
    class Config:
        from_attributes = True

class QuestionWithAnswer(QuestionOut):
    correct: str
    explanation: Optional[str] = None

class AnswerSubmit(BaseModel):
    question_id: int
    selected: str

class QuestionCorrection(BaseModel):
    correct: str
    explanation: str

class AnswerResult(BaseModel):
    is_correct: bool
    correct: str
    explanation: Optional[str] = None


# ── Simulados ─────────────────────────────────────────────────────────────────
class SimuladoOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    question_count: int
    duration_minutes: int
    class Config:
        from_attributes = True

class SimuladoSubmit(BaseModel):
    answers: Dict[str, str]  # {question_id: selected_option}

class SimuladoResult(BaseModel):
    score: float
    total: int
    correct: int
    per_question: List[Dict[str, Any]]


# ── Materials ─────────────────────────────────────────────────────────────────
class MaterialOut(BaseModel):
    id: int
    title: str
    subject: Optional[str]
    source: Optional[str]
    summary: Optional[str]
    mnemonic: Optional[str]
    sections: Optional[List[Dict]] = []
    created_at: datetime
    class Config:
        from_attributes = True


# ── Tutor ─────────────────────────────────────────────────────────────────────
class TutorMessage(BaseModel):
    agent_id: str
    message: str
    history: Optional[List[Dict[str, str]]] = []

class TutorHubMessage(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []


# ── Progress ──────────────────────────────────────────────────────────────────
class ProgressStats(BaseModel):
    total_answered: int
    correct: int
    accuracy: float
    streak: int
    by_subject: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]


# ── Preferences ───────────────────────────────────────────────────────────────
class PreferencesIn(BaseModel):
    difficulty: str = "Automático (SM-2)"
    format: str = "Misto"
    schedule: str = "Flexível"
    session_volume: str = "Médio (30q)"
    notes: str = ""
    exam_date: str = "10/11/2027"
    daily_hours: int = 2

class PreferencesOut(PreferencesIn):
    class Config:
        from_attributes = True


# ── Question Books ────────────────────────────────────────────────────────────
class QuestionBookOut(BaseModel):
    id: int
    title: str
    subject: Optional[str]
    source_filename: Optional[str]
    questions_generated: int
    created_at: datetime
    class Config:
        from_attributes = True


# ── Knowledge ─────────────────────────────────────────────────────────────────
class KnowledgeOut(BaseModel):
    subject: str
    mastery: float
    concept_count: int
    concepts: List[Dict[str, Any]]
