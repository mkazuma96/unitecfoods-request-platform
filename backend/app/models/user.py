from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum

# Enums based on design doc
class UserRole(str, enum.Enum):
    UNITEC_ADMIN = "UNITEC_ADMIN"
    UNITEC_SALES = "UNITEC_SALES"
    UNITEC_RD = "UNITEC_RD"
    CLIENT_ADMIN = "CLIENT_ADMIN"
    CLIENT_MEMBER = "CLIENT_MEMBER"

class CompanyType(str, enum.Enum):
    UNITEC = "UNITEC"
    CLIENT = "CLIENT"

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    representative_email = Column(String)
    type = Column(SQLEnum(CompanyType), default=CompanyType.CLIENT)
    address_default = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="company")
    issues = relationship("Issue", back_populates="company")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)
    is_active = Column(Boolean, default=True) # Added is_active
    role = Column(SQLEnum(UserRole), default=UserRole.CLIENT_MEMBER)
    invitation_token = Column(String, nullable=True, index=True) # Added for invitation flow
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="users")
    # Issues created by this user
    created_issues = relationship("Issue", foreign_keys="[Issue.creator_id]", back_populates="creator")
    # Issues assigned to this user (Unitec side)
    assigned_issues = relationship("Issue", foreign_keys="[Issue.assignee_id]", back_populates="assignee")

