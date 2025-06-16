from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import supabase
from supabase_auth.types import User

# This tells FastA\PI that the token will be sent in an 'Authorization: Bearer <TOKEN>' header.
# The `tokenUrl` is a required parameter but isn't used in this authentication flow.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Dependency to get the current user from the JWT in the Authorization header.

    Validates the token with Supabase and returns the user object.
    Raises an HTTPException if the token is invalid or the user is not found.
    """
    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
