from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum

# Enums
class IssueStatus(str, enum.Enum):
    DRAFT = "draft"       # Added Draft
    UNTOUCHED = "untouched"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    PROPOSING = "proposing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class BallHolder(str, enum.Enum):
    UNITEC = "UNITEC"
    CLIENT = "CLIENT"

class Urgency(str, enum.Enum):
    HIGH = "high"
    MIDDLE = "middle"
    LOW = "low"

class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    issue_code = Column(String, unique=True, index=True) # e.g. REQ-2025-0001
    
    company_id = Column(Integer, ForeignKey("companies.id"))
    creator_id = Column(Integer, ForeignKey("users.id"))
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    status = Column(SQLEnum(IssueStatus), default=IssueStatus.UNTOUCHED, index=True)
    ball_holder = Column(SQLEnum(BallHolder), default=BallHolder.UNITEC)
    
    category = Column(String, index=True) # flavor, texture, etc
    title = Column(String)
    product_name = Column(String)
    description = Column(Text) # Includes voice-to-text content
    
    urgency = Column(SQLEnum(Urgency), default=Urgency.MIDDLE)
    client_arbitrary_code = Column(String, nullable=True)
    desired_deadline = Column(Date, nullable=True)
    
    is_sample_provided = Column(Boolean, default=False)
    sample_shipping_info = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    company = relationship("Company", back_populates="issues")
    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_issues")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_issues")
    
    ingredients = relationship("Ingredient", back_populates="issue", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="issue", cascade="all, delete-orphan")
    internal_notes = relationship("InternalNote", back_populates="issue", cascade="all, delete-orphan")
    additional_questions = relationship("AdditionalQuestion", back_populates="issue", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="issue", cascade="all, delete-orphan")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"))
    name = Column(String)
    amount = Column(String)

    issue = relationship("Issue", back_populates="ingredients")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    has_attachment = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

    issue = relationship("Issue", back_populates="messages")
    sender = relationship("User")


class InternalNote(Base):
    __tablename__ = "internal_notes"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    issue = relationship("Issue", back_populates="internal_notes")
    author = relationship("User")


class AdditionalQuestion(Base):
    __tablename__ = "additional_questions"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"))
    question_text = Column(Text)
    answer_text = Column(Text, nullable=True)
    is_answered = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    answered_at = Column(DateTime(timezone=True), nullable=True)

    issue = relationship("Issue", back_populates="additional_questions")


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"))
    file_name = Column(String)
    file_path = Column(String) # Stored path or URL
    file_type = Column(String, nullable=True) # MIME type
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    issue = relationship("Issue", back_populates="attachments")
