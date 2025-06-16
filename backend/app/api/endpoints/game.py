import logging
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from app.core.config import supabase
from app.core.game_state import get_full_game_state, clear_game_state_cache
from app.schemas.game import (
    HandleWinRequest, HandleWinResponse, LogAttemptResponse,
    GameStateResponse, ProfileResponse, CreditPackResponse, PurchaseResponse
)
from app.api.deps import get_current_user
from postgrest import APIResponse
from typing import List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/game_state", response_model=GameStateResponse)
async def get_game_state():
    """Fetches the current public state of the game."""
    try:
        # Use optimized game state function
        game_state_data = await get_full_game_state()
        return GameStateResponse(**game_state_data)
    except Exception as e:
        logger.error(f"Error fetching game state: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch game state.")


@router.get("/me/profile", response_model=ProfileResponse)
async def get_my_profile(user=Depends(get_current_user)):
    """Fetches the profile for the currently authenticated user."""
    try:
        res = supabase.table('profiles').select("*").eq('id', str(user.id)).single().execute()
        return ProfileResponse(**res.data)
    except Exception as e:
        logger.error(f"Error fetching profile for user {user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user profile.")


@router.post("/log_attempt", response_model=LogAttemptResponse)
async def log_attempt(user=Depends(get_current_user)):
    """Logs an attempt and returns the current game state."""
    try:
        res: APIResponse = supabase.rpc('log_attempt', {'p_user_id': str(user.id)}).execute()
        return LogAttemptResponse(is_payout_phase_active=res.data)
    except Exception as e:
        logger.error(f"Error in /log_attempt for user {user.id}: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred while processing the attempt.")


@router.post("/handle_win", response_model=HandleWinResponse)
async def handle_win(win_request: HandleWinRequest, user=Depends(get_current_user)):
    """Handles the win condition, logs the chat, and resets the game state."""
    # Note: In a real app, you'd have logic here to verify the win is legitimate
    # before proceeding.
    log_id = None
    try:
        # 1. Create a winning chat log entry
        log_res = supabase.table('winning_chat_logs').insert({'user_id': str(user.id)}).execute()
        log_id = log_res.data[0]['id']

        # 2. Insert all messages from the winning chat
        messages_to_insert = [
            {'log_id': log_id, 'prompt': msg.prompt, 'response': msg.response}
            for msg in win_request.chat_log
        ]
        msg_res = supabase.table('winning_chat_messages').insert(messages_to_insert).execute()

        # 3. Create the final win record
        game_state = supabase.table('game_state').select('global_attempts').single().execute()
        
        win_res = supabase.table('wins').insert({
            'user_id': str(user.id),
            'global_attempt_at_win': game_state.data['global_attempts'],
            'winning_chat_log_id': log_id
        }).execute()

        # 4. Call the database function to reset the game state
        reset_res = supabase.rpc('handle_win', {}).execute()
        
        # 5. Clear game state cache after reset
        await clear_game_state_cache()
        
        return HandleWinResponse(status="success", win_id=win_res.data[0]['id'])

    except Exception as e:
        logger.error(f"Error in /handle_win for user {user.id}: {e}")
        # If a log entry was created but something failed after, attempt to clean it up.
        if log_id:
            supabase.table('winning_chat_logs').delete().eq('id', log_id).execute()
        raise HTTPException(status_code=500, detail=f"An error occurred during win processing.")


@router.get("/credit_packs", response_model=List[CreditPackResponse])
async def list_credit_packs():
    """Lists all available credit packs for purchase."""
    try:
        res = supabase.table('credit_packs').select("*").order('price').execute()
        return [CreditPackResponse(**pack) for pack in res.data]
    except Exception as e:
        logger.error(f"Error fetching credit packs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch credit packs.")


@router.post("/credit_packs/{pack_id}/purchase", response_model=PurchaseResponse)
async def purchase_credit_pack(pack_id: UUID, user=Depends(get_current_user)):
    """
    Handles a credit purchase for a user by calling the atomic
    'purchase_credits' database function.
    """
    try:
        # A real application would integrate with a payment provider like Stripe here
        # to confirm payment before calling this endpoint.

        params = {'p_user_id': str(user.id), 'p_pack_id': str(pack_id)}
        res = supabase.rpc('purchase_credits', params).execute()

        purchase_data = res.data[0]
        return PurchaseResponse(
            status="success",
            purchase_id=purchase_data['purchase_id'],
            new_credits_balance=purchase_data['new_credits_balance']
        )

    except Exception as e:
        logger.error(f"Error in /purchase for user {user.id}, pack {pack_id}: {e}")
        # Check for a specific error message from our function
        if "Credit pack not found" in str(e):
            raise HTTPException(status_code=404, detail="Credit pack not found.")
        raise HTTPException(status_code=500, detail="An error occurred during the purchase process.")
    
    
