from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
import logging

from app.db.session import get_db
from app.models.user import User, UserRole, Company
from app.schemas.user import CompanyCreate, CompanyRead, UserInviteResponse
from app.api.deps import get_current_user
from app.core.security import get_password_hash

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[CompanyRead])
def read_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve companies. Only for UNITEC_ADMIN or UNITEC_SALES/RD.
    """
    # Simple permission check (allow all unitec roles for now)
    if "UNITEC" not in current_user.role.value:
        raise HTTPException(status_code=403, detail="Not authorized")

    companies = db.query(Company).offset(skip).limit(limit).all()
    return companies

@router.post("/", response_model=UserInviteResponse)
def create_company(
    *,
    db: Session = Depends(get_db),
    company_in: CompanyCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new company and its first admin user (CLIENT_ADMIN).
    Only UNITEC_ADMIN can do this.
    """
    logger.info(f"Create Company Request by User: {current_user.email}, Role: {current_user.role}")

    # Flexible check: Allow if role is strictly UNITEC_ADMIN or its string value
    if current_user.role != UserRole.UNITEC_ADMIN and current_user.role.value != "UNITEC_ADMIN":
        logger.warning(f"Access denied. User role: {current_user.role}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Only Unitec Admin can create companies. Your role is: {current_user.role}"
        )

    # 1. Check if company name already exists
    if db.query(Company).filter(Company.name == company_in.name).first():
        raise HTTPException(status_code=400, detail="Company with this name already exists.")

    # 2. Check if user email already exists
    if db.query(User).filter(User.email == company_in.representative_email).first():
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    # 3. Create Company
    db_company = Company(
        name=company_in.name,
        representative_email=company_in.representative_email,
        address_default=company_in.address_default
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)

    # 4. Create User (CLIENT_ADMIN) with invitation token
    invitation_token = str(uuid.uuid4())
    db_user = User(
        email=company_in.representative_email,
        name=company_in.representative_name,
        password_hash=get_password_hash(str(uuid.uuid4())), # Placeholder password
        role=UserRole.CLIENT_ADMIN,
        company_id=db_company.id,
        invitation_token=invitation_token,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # 5. Log invitation link
    invite_link = f"http://localhost:3000/invite?token={invitation_token}"
    logger.info(f"=== COMPANY REGISTRATION INVITATION ===")
    logger.info(f"Company: {db_company.name}")
    logger.info(f"User: {db_user.email}")
    logger.info(f"Link: {invite_link}")
    logger.info("=======================================")

    return UserInviteResponse(
        message="Company and admin user created. Invitation link generated.",
        invitation_link=invite_link
    )

