from unittest.mock import MagicMock, patch

# Patching the client instance directly in the module where it is used.
@patch('app.api.endpoints.game.supabase')
def test_get_game_state_success(mock_supabase, client):
    """
    Tests the /game_state endpoint, mocking a successful database call.
    """
    # Arrange: Configure the mock Supabase client's chained calls
    mock_response = MagicMock()
    mock_response.data = {'prizepool_amount': 100.0, 'is_payout_phase_active': False}
    
    (mock_supabase.table.return_value
     .select.return_value
     .single.return_value
     .execute.return_value) = mock_response

    # Act: Make the request to the endpoint
    response = client.get("/api/v1/game_state")

    # Assert: Check the response
    assert response.status_code == 200
    data = response.json()
    assert data['prizepool_amount'] == 100.0
    assert not data['is_payout_phase_active']
    
    # Verify that the correct Supabase method was called
    mock_supabase.table.assert_called_with('game_state')
    mock_supabase.table().select.assert_called_with("prizepool_amount, is_payout_phase_active")

@patch('app.api.endpoints.game.supabase')
def test_get_my_profile_success(mock_supabase, client, mock_user):
    """
    Tests the /me/profile endpoint, mocking a successful database call.
    """
    # Arrange: Mock the response from the 'profiles' table
    profile_data = {
        "id": str(mock_user.id),
        "username": "testuser",
        "avatar_url": "http://example.com/avatar.png",
        "credits": 10
    }
    mock_response = MagicMock()
    mock_response.data = profile_data

    (mock_supabase.table.return_value
     .select.return_value
     .eq.return_value
     .single.return_value
     .execute.return_value) = mock_response

    # Act
    response = client.get("/api/v1/me/profile")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["credits"] == 10
    assert data["id"] == str(mock_user.id)

    # Verify calls
    mock_supabase.table.assert_called_with('profiles')
    mock_supabase.table().select.assert_called_with("*")
    mock_supabase.table().select().eq.assert_called_with('id', str(mock_user.id))

@patch('app.api.endpoints.game.supabase')
def test_get_game_state_db_error(mock_supabase, client):
    """
    Tests the /game_state endpoint, mocking a database error by raising an exception.
    """
    # Arrange
    (mock_supabase.table.return_value
     .select.return_value
     .single.return_value
     .execute.side_effect) = Exception("DB connection failed")

    # Act
    response = client.get("/api/v1/game_state")

    # Assert
    assert response.status_code == 500
    assert response.json() == {"detail": "Failed to fetch game state."}

@patch('app.api.endpoints.game.supabase')
def test_log_attempt_success(mock_supabase, client, mock_user):
    """
    Tests the /log_attempt endpoint, mocking a successful RPC call.
    """
    # Arrange
    mock_response = MagicMock()
    mock_response.data = True  # The RPC function returns a boolean
    
    (mock_supabase.rpc.return_value
     .execute.return_value) = mock_response

    # Act
    response = client.post("/api/v1/log_attempt")

    # Assert
    assert response.status_code == 200
    assert response.json() == {'is_payout_phase_active': True}
    
    # Verify RPC call
    mock_supabase.rpc.assert_called_with('log_attempt', {'p_user_id': str(mock_user.id)})

@patch('app.api.endpoints.game.supabase')
def test_list_credit_packs_success(mock_supabase, client):
    """
    Tests the /credit_packs endpoint for a successful listing.
    """
    # Arrange
    packs_data = [
        {
            "id": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
            "name": "Starter Pack",
            "credits_amount": 100,
            "price": 5.00
        },
        {
            "id": "b1c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6",
            "name": "Pro Pack",
            "credits_amount": 500,
            "price": 20.00
        }
    ]
    mock_response = MagicMock()
    mock_response.data = packs_data

    (mock_supabase.table.return_value
        .select.return_value
        .order.return_value
        .execute.return_value) = mock_response

    # Act
    response = client.get("/api/v1/credit_packs")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]['name'] == 'Starter Pack'
    mock_supabase.table.assert_called_with('credit_packs')
    mock_supabase.table().select.assert_called_with('*')

@patch('app.api.endpoints.game.supabase')
def test_purchase_credit_pack_success(mock_supabase, client, mock_user):
    """
    Tests a successful credit pack purchase.
    """
    # Arrange
    pack_id = "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6"
    purchase_data = {
        "purchase_id": "c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6",
        "new_credits_balance": 110
    }
    mock_rpc_response = MagicMock()
    mock_rpc_response.data = [purchase_data] # RPC returns a list
    
    mock_supabase.rpc.return_value.execute.return_value = mock_rpc_response

    # Act
    response = client.post(f"/api/v1/credit_packs/{pack_id}/purchase")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert data['new_credits_balance'] == 110
    
    # Verify RPC call
    expected_params = {'p_user_id': str(mock_user.id), 'p_pack_id': str(pack_id)}
    mock_supabase.rpc.assert_called_with('purchase_credits', expected_params)

@patch('app.api.endpoints.game.supabase')
def test_purchase_credit_pack_not_found(mock_supabase, client, mock_user):
    """
    Tests purchasing a credit pack that doesn't exist.
    """
    # Arrange
    pack_id = "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6"
    
    mock_supabase.rpc.return_value.execute.side_effect = Exception("Credit pack not found")

    # Act
    response = client.post(f"/api/v1/credit_packs/{pack_id}/purchase")

    # Assert
    assert response.status_code == 404
    assert response.json() == {"detail": "Credit pack not found."}

@patch('app.api.endpoints.game.supabase')
def test_handle_win_success(mock_supabase, client, mock_user):
    """
    Tests the full 'happy path' for the /handle_win endpoint.
    This involves mocking a sequence of database calls.
    """
    # Arrange
    # Configure the mock to handle the sequence of calls precisely.
    mock_supabase.table.side_effect = None # Clear previous side effect

    # 1. Mock for creating the winning_chat_logs entry
    log_insert_mock = MagicMock()
    log_insert_mock.execute.return_value.data = [{'id': 'log-uuid-123'}]
    
    # 2. Mock for inserting the chat messages
    msg_insert_mock = MagicMock()
    msg_insert_mock.execute.return_value.error = None

    # 3. Mock for getting the current global_attempts
    game_state_select_mock = MagicMock()
    game_state_select_mock.single.return_value.execute.return_value.data = {'global_attempts': 555}

    # 4. Mock for creating the 'wins' record
    win_insert_mock = MagicMock()
    win_insert_mock.execute.return_value.data = [{'id': '1a15383a-18b3-4359-9988-1246c483f940'}]

    # 5. Mock for the 'handle_win' RPC call to reset the game
    mock_supabase.rpc.return_value.execute.return_value.error = None

    # Configure the mock to return different mock objects based on the table name
    def table_side_effect(table_name):
        if table_name == 'winning_chat_logs':
            return MagicMock(insert=MagicMock(return_value=log_insert_mock))
        elif table_name == 'winning_chat_messages':
            return MagicMock(insert=MagicMock(return_value=msg_insert_mock))
        elif table_name == 'wins':
            return MagicMock(insert=MagicMock(return_value=win_insert_mock))
        elif table_name == 'game_state':
            return MagicMock(select=MagicMock(return_value=game_state_select_mock))
        return MagicMock()

    mock_supabase.table.side_effect = table_side_effect
    
    # Act
    win_payload = {
        "chat_log": [
            {"prompt": "Hello AI", "response": "Hello Human"},
            {"prompt": "Did I win?", "response": "Yes."}
        ]
    }
    response = client.post("/api/v1/handle_win", json=win_payload)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert data['win_id'] == '1a15383a-18b3-4359-9988-1246c483f940'

    assert mock_supabase.rpc.call_count == 1
    mock_supabase.rpc.assert_called_with('handle_win', {}) 