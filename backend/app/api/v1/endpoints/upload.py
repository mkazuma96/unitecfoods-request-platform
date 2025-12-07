from typing import Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import shutil
import os
from datetime import datetime
import uuid

from app.db.session import get_db
from app.core import security
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.issue import AttachmentRead

router = APIRouter()

UPLOAD_DIR = "uploads"

@router.post("/", response_model=AttachmentRead)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Upload a file.
    Returns the file path and metadata.
    Note: In a real app, we would upload to S3 here.
    For MVP, we save to local disk and return a relative URL.
    """
    
    # Validate file size (mock check, FastAPI handles stream but we can check content-length header if needed)
    # Validate file type (extension check)
    allowed_extensions = {".png", ".jpg", ".jpeg", ".pdf", ".xlsx", ".xls", ".doc", ".docx"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
         raise HTTPException(status_code=400, detail="File type not allowed")

    # Generate unique filename
    file_id = str(uuid.uuid4())
    secure_filename = f"{file_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, secure_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        print(f"Error saving file: {e}")
        raise HTTPException(status_code=500, detail="Could not save file")

    # Return metadata (We don't save to DB yet, the caller will link it to an Issue)
    # But wait, our Schema expects an ID. 
    # Actually, usually we upload -> get URL -> submit Issue with URL.
    # Or we submit Issue -> upload files linked to Issue ID.
    
    # Approach A: Upload first. Return temporary metadata.
    # The Issue creation endpoint will accept a list of file paths/names and create Attachment records.
    
    return {
        "id": 0, # Temporary ID, will be real DB ID after Issue creation
        "file_name": file.filename,
        "file_path": f"/static/{secure_filename}", # Public URL
        "file_type": file.content_type,
        "uploaded_at": datetime.now()
    }

