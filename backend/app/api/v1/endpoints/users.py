from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
import logging

from app.db.session import get_db
from app.models.user import User, UserRole, Company
from app.schemas.user import UserInvite, UserInviteResponse, UserAcceptInvite, User as UserSchema, CompanyRead
from app.api.deps import get_current_user
from app.core.security import get_password_hash

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/invite", response_model=UserInviteResponse)
def invite_user(
    *,
    db: Session = Depends(get_db),
    invite_in: UserInvite,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Invite a new member to the company.
    Only CLIENT_ADMIN can invite.
    """
    # Permission check
    if current_user.role != UserRole.CLIENT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Client Admin can invite members."
        )
    
    # Check if user already exists
    user = db.query(User).filter(User.email == invite_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists."
        )
    
    # Generate invitation token
    invitation_token = str(uuid.uuid4())
    
    # Create user with placeholder password (cannot login) and token
    # We set a random unusable password initially
    db_user = User(
        email=invite_in.email,
        name=invite_in.name,
        password_hash=get_password_hash(str(uuid.uuid4())), 
        role=UserRole.CLIENT_MEMBER,
        company_id=current_user.company_id,
        invitation_token=invitation_token,
        is_active=True # Active, but needs password reset
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Simulate email sending by logging
    invite_link = f"http://localhost:3000/invite?token={invitation_token}"
    logger.info(f"=== INVITATION LINK FOR {invite_in.email} ===")
    logger.info(invite_link)
    logger.info("============================================")
    
    return UserInviteResponse(
        message="Invitation created. Check server logs for link.",
        invitation_link=invite_link
    )

@router.post("/accept-invite")
def accept_invite(
    *,
    db: Session = Depends(get_db),
    accept_in: UserAcceptInvite,
) -> Any:
    """
    Accept invitation and set password.
    """
    user = db.query(User).filter(User.invitation_token == accept_in.token).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Invalid or expired invitation token."
        )
    
    # Update password and clear token
    user.password_hash = get_password_hash(accept_in.password)
    user.invitation_token = None
    
    db.add(user)
    db.commit()
    
    return {"message": "Password set successfully. You can now login."}

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("/company", response_model=CompanyRead)
def read_company_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user's company info with members.
    """
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    return company

