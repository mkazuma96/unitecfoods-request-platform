from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
from app.models.issue import IssueStatus, BallHolder, Urgency

# --- Enums are imported from models to ensure consistency ---

# --- 1. Ingredients (配分情報) ---
class IngredientBase(BaseModel):
    name: str = Field(..., min_length=1)
    amount: str = Field(..., min_length=1)

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int
    class Config:
        from_attributes = True

# --- 2. Attachments ---
class AttachmentBase(BaseModel):
    file_name: str
    file_type: Optional[str] = None

class AttachmentCreate(AttachmentBase):
    file_path: str # Path returned from upload API

class AttachmentRead(AttachmentBase):
    id: int
    file_path: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# --- 3. Issue (課題) ---

# Shared properties
class IssueBase(BaseModel):
    title: str = Field(..., min_length=1)
    category: str
    product_name: str = Field(..., min_length=1)
    description: Optional[str] = None
    urgency: Urgency = Urgency.MIDDLE
    desired_deadline: Optional[date] = None
    client_arbitrary_code: Optional[str] = None
    is_sample_provided: bool = False
    sample_shipping_info: Optional[str] = None

# Properties to receive on item creation
class IssueCreate(IssueBase):
    ingredients: List[IngredientCreate] = []
    attachments: List[AttachmentCreate] = [] # Added attachments
    status: IssueStatus = IssueStatus.UNTOUCHED

# Properties to receive on item update
class IssueUpdate(IssueBase):
    title: Optional[str] = None
    category: Optional[str] = None
    product_name: Optional[str] = None
    ingredients: Optional[List[IngredientCreate]] = None
    attachments: Optional[List[AttachmentCreate]] = None # Added attachments
    status: Optional[IssueStatus] = None

# Properties to return to client
class IssueRead(IssueBase):
    id: int
    issue_code: str
    status: IssueStatus
    ball_holder: BallHolder
    created_at: datetime
    updated_at: datetime
    
    # Relations
    ingredients: List[Ingredient] = []
    attachments: List[AttachmentRead] = []
    creator_name: Optional[str] = None
    company_name: Optional[str] = None # Added company_name
    
    class Config:
        from_attributes = True

# Properties for list view (lighter)
class IssueListSummary(BaseModel):
    id: int
    issue_code: str
    title: str
    status: IssueStatus
    category: str
    urgency: Urgency
    ball_holder: BallHolder
    created_at: datetime
    product_name: str
    company_name: Optional[str] = None
    
    class Config:
        from_attributes = True
