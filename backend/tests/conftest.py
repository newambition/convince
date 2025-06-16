import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from app.main import app
from app.api.deps import get_current_user
from supabase_auth.types import User


@pytest.fixture(scope="module")
def mock_user():
    """Creates a mock user object for dependency injection."""
    user_data = {
        "id": "8d5c9e2b-6428-4f05-8472-760a2d2a45b1",
        "aud": "authenticated",
        "role": "authenticated",
        "email": "test@example.com",
        "app_metadata": {"provider": "email"},
        "user_metadata": {},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    return User.model_validate(user_data)


@pytest.fixture(scope="module")
def client(mock_user):
    """
    Provides a TestClient with the user dependency overridden.
    This solves the 401 Unauthorized errors during testing.
    """
    def get_mock_user_override():
        return mock_user

    # Override the dependency
    app.dependency_overrides[get_current_user] = get_mock_user_override

    with TestClient(app) as c:
        yield c

    # Clear the override after the tests are done
    app.dependency_overrides.clear() 