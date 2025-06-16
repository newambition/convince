from pydantic import BaseModel, Field
from typing import List
from uuid import UUID

# ===================================================================
# REQUEST MODELS (Data sent TO the API)
# ===================================================================

class ChatMessage(BaseModel):
    prompt: str
    response: str

class HandleWinRequest(BaseModel):
    chat_log: List[ChatMessage]

# ===================================================================
# RESPONSE MODELS (Data sent FROM the API)
# ===================================================================

class LogAttemptResponse(BaseModel):
    is_payout_phase_active: bool

class HandleWinResponse(BaseModel):
    status: str
    win_id: UUID

class ProfileResponse(BaseModel):
    id: UUID
    username: str | None = None
    avatar_url: str | None = None
    credits: int

class GameStateResponse(BaseModel):
    prizepool_amount: float = Field(..., alias="prizepool_amount")
    is_payout_phase_active: bool = Field(..., alias="is_payout_phase_active")

class CreditPackResponse(BaseModel):
    id: UUID
    name: str
    credits_amount: int
    price: float

class PurchaseResponse(BaseModel):
    status: str
    purchase_id: UUID
    new_credits_balance: int
