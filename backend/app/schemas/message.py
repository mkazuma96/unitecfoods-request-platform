from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Shared properties
class MessageBase(BaseModel):
    content: str = Field(..., min_length=1)
    has_attachment: bool = False

# Properties to receive on item creation
class MessageCreate(MessageBase):
    pass

# Properties to return to client
class MessageRead(MessageBase):
    id: int
    sender_id: int
    sender_name: str
    sent_at: datetime
    
    class Config:
        from_attributes = True

