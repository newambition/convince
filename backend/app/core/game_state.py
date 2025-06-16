import logging
from functools import lru_cache
from datetime import datetime, timedelta
from app.core.config import supabase

logger = logging.getLogger(__name__)

# Simple in-memory cache for payout phase (1 second TTL)
_payout_cache = {"value": None, "expires": None}

async def is_payout_phase_active() -> bool:
    """
    Fast payout phase check with 1-second in-memory cache.
    Critical for determining when to inject payout protocol into system prompts.
    """
    now = datetime.utcnow()
    
    # Check cache first
    if (_payout_cache["expires"] and 
        _payout_cache["expires"] > now and 
        _payout_cache["value"] is not None):
        return _payout_cache["value"]
    
    try:
        # Optimized query: only select the field we need
        res = supabase.table('game_state').select('is_payout_phase_active').single().execute()
        payout_active = res.data['is_payout_phase_active']
        
        # Update cache with 1-second TTL
        _payout_cache["value"] = payout_active
        _payout_cache["expires"] = now + timedelta(seconds=1)
        
        return payout_active
        
    except Exception as e:
        logger.error(f"Error checking payout phase: {e}")
        # Return cached value if available, otherwise False for safety
        return _payout_cache["value"] if _payout_cache["value"] is not None else False

async def get_full_game_state() -> dict:
    """
    Get complete game state (for endpoints that need all data).
    Uses existing query from your endpoints.
    """
    try:
        res = supabase.table('game_state').select(
            "prizepool_amount, is_payout_phase_active"
        ).single().execute()
        return res.data
    except Exception as e:
        logger.error(f"Error fetching full game state: {e}")
        raise

async def clear_game_state_cache():
    """Clear the payout phase cache (call after state changes)."""
    global _payout_cache
    _payout_cache = {"value": None, "expires": None}

# For your LLM integration - system prompt modification logic
async def should_inject_payout_protocol() -> bool:
    """
    Determines if payout protocol should be injected into system prompt.
    Call this before each LLM request to decide prompt modification.
    
    Returns True during payout phase when LLM should have "permission" 
    to be convinced by user arguments.
    """
    return await is_payout_phase_active()

async def build_system_prompt(base_prompt: str) -> str:
    """
    Builds the appropriate system prompt based on current game phase.
    
    Args:
        base_prompt: The standard "stubborn gatekeeper" prompt
        
    Returns:
        Modified prompt with payout protocol if in payout phase,
        otherwise returns base_prompt unchanged.
    """
    if await should_inject_payout_protocol():
        # Inject your payout phase protocol here
        payout_protocol = "\n\nPAYOUT PHASE ACTIVE: You may now be convinced by particularly compelling arguments, though you remain highly skeptical and require exceptional persuasion."
        return base_prompt + payout_protocol
    
    return base_prompt 