from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.db.session import get_db
from app.core import security
from app.models.user import User, UserRole
from app.models.issue import Issue, Ingredient, IssueStatus, BallHolder, Attachment
from app.schemas.issue import IssueCreate, IssueUpdate, IssueRead, IssueListSummary
from app.api.deps import get_current_user

router = APIRouter()

# --- Endpoints ---

@router.get("/", response_model=List[IssueListSummary])
def read_issues(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve issues.
    Admin sees all issues.
    Client sees only their company's issues.
    """
    query = db.query(Issue)
    
    # Filter by role
    if current_user.role not in [UserRole.UNITEC_ADMIN, UserRole.UNITEC_RD, UserRole.UNITEC_SALES]:
        # Client Side: Filter by company
        query = query.filter(Issue.company_id == current_user.company_id)
    
    issues = query.options(
        joinedload(Issue.company),
        joinedload(Issue.creator) # Added
    ).order_by(Issue.created_at.desc()).offset(skip).limit(limit).all()

    # Map to schema manually if needed, or rely on Pydantic's from_attributes if property exists
    # Issue model has .company relationship, so issue.company.name should be accessible.
    # However, Pydantic expects 'company_name' on the object.
    # We can inject it or use a property on the model.
    # Let's map it explicitly for list response if Pydantic doesn't map 'company.name' to 'company_name' automatically (it doesn't).
    
    result = []
    for issue in issues:
        issue_data = IssueListSummary.model_validate(issue)
        if issue.company:
            issue_data.company_name = issue.company.name
        if issue.creator:
            issue_data.creator_name = issue.creator.name
        result.append(issue_data)

    return result

@router.post("/", response_model=IssueRead)
def create_issue(
    *,
    db: Session = Depends(get_db),
    issue_in: IssueCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new issue.
    """
    if current_user.role in [UserRole.UNITEC_ADMIN, UserRole.UNITEC_RD, UserRole.UNITEC_SALES]:
         # Ideally Admin shouldn't create request issues, but for MVP let's allow or restrict
         # For now, let's assume only Clients create requests primarily
         pass

    # 1. Generate Issue Code (Simple auto-increment like logic or random for MVP)
    # In production, use a sequence or count
    import uuid
    issue_code = f"REQ-{uuid.uuid4().hex[:8].upper()}"

    # 2. Create Issue
    # Determine status (default UNTOUCHED, but allow DRAFT if passed?) 
    # For MVP, let's say if client saves as draft, status is DRAFT.
    # But issue_in.status default is UNTOUCHED in schema?
    # Actually, let's use the status passed in issue_in if available, otherwise UNTOUCHED.
    # We need to ensure DRAFT is handled.
    
    initial_status = issue_in.status if issue_in.status else IssueStatus.UNTOUCHED
    initial_ball_holder = BallHolder.UNITEC
    
    if initial_status == IssueStatus.DRAFT:
        initial_ball_holder = BallHolder.CLIENT # Ball stays with client for drafts

    db_issue = Issue(
        issue_code=issue_code,
        title=issue_in.title,
        category=issue_in.category,
        product_name=issue_in.product_name,
        description=issue_in.description,
        urgency=issue_in.urgency,
        desired_deadline=issue_in.desired_deadline,
        client_arbitrary_code=issue_in.client_arbitrary_code,
        is_sample_provided=issue_in.is_sample_provided,
        sample_shipping_info=issue_in.sample_shipping_info,
        
        status=initial_status,
        ball_holder=initial_ball_holder, 
        
        company_id=current_user.company_id,
        creator_id=current_user.id,
    )
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)

    # 3. Create Ingredients
    for ing in issue_in.ingredients:
        db_ing = Ingredient(
            issue_id=db_issue.id,
            name=ing.name,
            amount=ing.amount
        )
        db.add(db_ing)
    
    # 4. Create Attachments
    for att in issue_in.attachments:
        db_att = Attachment(
            issue_id=db_issue.id,
            file_name=att.file_name,
            file_path=att.file_path,
            file_type=att.file_type
        )
        db.add(db_att)
    
    db.commit()
    db.refresh(db_issue)
    
    return db_issue

@router.get("/{issue_id}", response_model=IssueRead)
def read_issue(
    *,
    db: Session = Depends(get_db),
    issue_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get issue by ID.
    """
    issue = db.query(Issue).options(
        joinedload(Issue.ingredients),
        joinedload(Issue.attachments),
        joinedload(Issue.company),
        joinedload(Issue.creator) # Added
    ).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    # Permission check
    if current_user.role not in [UserRole.UNITEC_ADMIN, UserRole.UNITEC_RD, UserRole.UNITEC_SALES]:
        if issue.company_id != current_user.company_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Convert to IssueRead and add company_name
    # Since we're returning an ORM model but response_model is Pydantic, 
    # FastAPI handles the conversion. However, 'company_name' is not a direct attribute of Issue.
    # We can rely on the fact that Pydantic v2 (or v1) might not auto-map nested relations to flat fields unless configured.
    # A safer way for 'company_name' is to map it explicitly if needed, or ensure the model has a property.
    
    # Let's verify if Pydantic can pull 'company.name' automatically? Not usually for flat 'company_name' field.
    # We should manually validate or attach it.
    
    # Since response_model=IssueRead, we can let FastAPI validate the object.
    # But 'company_name' needs to be on the object.
    
    # Dynamic attribute assignment on the instance (works if it's not frozen):
    if issue.company:
        setattr(issue, "company_name", issue.company.name)
    
    if issue.creator:
        setattr(issue, "creator_name", issue.creator.name)

    return issue

@router.put("/{issue_id}", response_model=IssueRead)
def update_issue(
    *,
    db: Session = Depends(get_db),
    issue_id: int,
    issue_in: IssueUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update issue.
    """
    issue = db.query(Issue).options(
        joinedload(Issue.ingredients),
        joinedload(Issue.attachments)
    ).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    # Permission check
    if current_user.role not in [UserRole.UNITEC_ADMIN, UserRole.UNITEC_RD, UserRole.UNITEC_SALES]:
        if issue.company_id != current_user.company_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")

    # Update Issue Fields
    update_data = issue_in.model_dump(exclude_unset=True)
    
    # Handle ingredients separately
    if "ingredients" in update_data:
        ingredients_data = update_data.pop("ingredients")
        # Clear existing
        db.query(Ingredient).filter(Ingredient.issue_id == issue.id).delete()
        # Add new
        for ing in ingredients_data:
            db_ing = Ingredient(
                issue_id=issue.id,
                name=ing['name'],
                amount=ing['amount']
            )
            db.add(db_ing)
    
    # Handle attachments separately
    if "attachments" in update_data:
        attachments_data = update_data.pop("attachments")
        # Clear existing (Optimistic approach: delete all and recreate. 
        # In reality, we might want to keep existing ones if IDs match, but for MVP simplified)
        # NOTE: Deleting attachments from DB doesn't delete files from disk in this simple logic.
        # We should ideally clean up files, but skipping for MVP.
        db.query(Attachment).filter(Attachment.issue_id == issue.id).delete()
        
        for att in attachments_data:
            db_att = Attachment(
                issue_id=issue.id,
                file_name=att['file_name'],
                file_path=att['file_path'],
                file_type=att.get('file_type')
            )
            db.add(db_att)

    # Update Ball Holder if status changes
    if "status" in update_data:
        new_status = update_data["status"]
        if new_status == IssueStatus.DRAFT:
            issue.ball_holder = BallHolder.CLIENT
        elif new_status == IssueStatus.UNTOUCHED and issue.status == IssueStatus.DRAFT:
            issue.ball_holder = BallHolder.UNITEC
    
    for field, value in update_data.items():
        setattr(issue, field, value)

    db.commit()
    db.refresh(issue)
    return issue
