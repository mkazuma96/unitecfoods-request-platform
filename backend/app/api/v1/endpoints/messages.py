from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.issue import Issue, Message
from app.schemas.message import MessageCreate, MessageRead
from app.api.deps import get_current_user

router = APIRouter()

def get_formatted_sender_name(user: User) -> str:
    if not user:
        return "Unknown User"
    
    # Check if Unitec side
    if user.role in [UserRole.UNITEC_ADMIN, UserRole.UNITEC_RD, UserRole.UNITEC_SALES]:
        return user.name
    else:
        # Client side
        company_name = user.company.name if user.company else ""
        return f"{company_name} {user.name}".strip()

@router.get("/{issue_id}/messages", response_model=List[MessageRead])
def read_messages(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all messages for a specific issue.
    """
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    # Permission check
    if current_user.role not in [UserRole.UNITEC_ADMIN, UserRole.UNITEC_RD, UserRole.UNITEC_SALES]:
        if issue.company_id != current_user.company_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")

    # Eager load sender and sender's company to avoid N+1 and detached session errors
    messages = db.query(Message).options(
        joinedload(Message.sender).joinedload(User.company)
    ).filter(Message.issue_id == issue_id).order_by(Message.sent_at.asc()).all()
    
    # Enrich with sender name
    result = []
    for msg in messages:
        sender_name = get_formatted_sender_name(msg.sender)
        result.append(
            MessageRead(
                id=msg.id,
                content=msg.content,
                has_attachment=msg.has_attachment,
                sender_id=msg.sender_id,
                sender_name=sender_name,
                sent_at=msg.sent_at
            )
        )
    return result

@router.post("/{issue_id}/messages", response_model=MessageRead)
def create_message(
    issue_id: int,
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new message in a issue.
    """
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    # Permission check
    if current_user.role not in [UserRole.UNITEC_ADMIN, UserRole.UNITEC_RD, UserRole.UNITEC_SALES]:
        if issue.company_id != current_user.company_id:
            raise HTTPException(status_code=400, detail="Not enough permissions")

    # Create message
    db_msg = Message(
        issue_id=issue_id,
        sender_id=current_user.id,
        content=msg_in.content,
        has_attachment=msg_in.has_attachment
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    
    # We need to reload the user to get company info for formatting, 
    # but current_user already has it loaded usually.
    sender_name = get_formatted_sender_name(current_user)

    return MessageRead(
        id=db_msg.id,
        content=db_msg.content,
        has_attachment=db_msg.has_attachment,
        sender_id=db_msg.sender_id,
        sender_name=sender_name,
        sent_at=db_msg.sent_at
    )
