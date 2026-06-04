from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    answers = relationship("UserAnswer", back_populates="user")
    simulado_sessions = relationship("SimuladoSession", back_populates="user")
    preferences = relationship("Preferences", back_populates="user", uselist=False)
    materials = relationship("Material", back_populates="user")
    knowledge_nodes = relationship("KnowledgeNode", back_populates="user")


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)   # {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct = Column(String, nullable=False)  # "A"|"B"|"C"|"D"
    explanation = Column(Text)
    subject = Column(String)    # "Manobra", "Legislação Marítima", etc.
    discipline = Column(String) # agent number "1"-"14"
    difficulty = Column(String, default="Médio")  # Fácil | Médio | Difícil
    source = Column(String)     # bibliographic reference

    answers = relationship("UserAnswer", back_populates="question")


class UserAnswer(Base):
    __tablename__ = "user_answers"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    selected = Column(String)
    is_correct = Column(Boolean)
    answered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="answers")
    question = relationship("Question", back_populates="answers")


class Simulado(Base):
    __tablename__ = "simulados"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    question_ids = Column(JSON)   # list of question IDs
    duration_minutes = Column(Integer, default=60)

    sessions = relationship("SimuladoSession", back_populates="simulado")


class SimuladoSession(Base):
    __tablename__ = "simulado_sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    simulado_id = Column(Integer, ForeignKey("simulados.id"))
    answers = Column(JSON)        # {"question_id": "selected_option", ...}
    score = Column(Float)
    total = Column(Integer)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="simulado_sessions")
    simulado = relationship("Simulado", back_populates="sessions")


class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    subject = Column(String)
    source = Column(String)
    content = Column(Text)        # raw extracted text
    summary = Column(Text)        # AI-generated summary
    mnemonic = Column(Text)       # AI-generated mnemonic
    sections = Column(JSON)       # [{"title": ..., "content": ..., "key_points": [...]}]
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="materials")


class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    concept = Column(String, nullable=False)
    subject = Column(String)
    mastery = Column(Float, default=0.0)   # 0–100
    seen_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="knowledge_nodes")


class Preferences(Base):
    __tablename__ = "preferences"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    difficulty = Column(String, default="Automático (SM-2)")
    format = Column(String, default="Misto")
    schedule = Column(String, default="Flexível")
    session_volume = Column(String, default="Médio (30q)")
    notes = Column(Text, default="")
    exam_date = Column(String, default="10/11/2027")
    daily_hours = Column(Integer, default=2)

    user = relationship("User", back_populates="preferences")


class StudyTrail(Base):
    __tablename__ = "study_trails"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(JSON)        # list of sprint objects
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    next_at = Column(DateTime)


class QuestionBook(Base):
    __tablename__ = "question_books"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    subject = Column(String)
    source_filename = Column(String)
    content = Column(Text)               # raw extracted text
    questions_generated = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])
