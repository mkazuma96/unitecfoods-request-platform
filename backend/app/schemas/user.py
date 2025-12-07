from typing import Optional, List
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    role: UserRole = UserRole.CLIENT_MEMBER
    name: Optional[str] = None
    company_id: Optional[int] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str
    company_id: int

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None
    
    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    pass

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str

# Login schema
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None # sub is typically string (user id)

# --- Invitation Schemas ---
class UserInvite(BaseModel):
    email: EmailStr
    name: str

class UserInviteResponse(BaseModel):
    message: str
    invitation_link: str # For MVP debugging

class UserAcceptInvite(BaseModel):
    token: str
    password: str

# --- Company Info Schemas ---
class CompanyBase(BaseModel):
    name: str
    representative_email: Optional[str] = None
    address_default: Optional[str] = None

class CompanyRead(CompanyBase):
    id: int
    users: List[User] = []

    class Config:
        from_attributes = True
