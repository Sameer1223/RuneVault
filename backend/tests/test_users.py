"""
Tests for user endpoints (/api/user).
"""
import pytest
from unittest.mock import patch, MagicMock
from models.user import User


class TestUserSyncEndpoint:
    """Tests for POST /api/user/sync-user"""

    @patch("auth.auth.verify_decode_jwt")
    def test_sync_user_creates_new_user(self, mock_verify, client, db):
        """Test creating a new user on first login"""
        # Mock auth
        mock_verify.return_value = {"sub": "auth0|123456789"}
        
        response = client.post(
            "/api/user/sync-user",
            headers={"Authorization": "Bearer test-token"},
            json={},
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data["auth0_id"] == "auth0|123456789"
        assert data["is_new"] is True
        assert "username" in data
        
        # Verify user was created in DB
        user = User.query.filter_by(auth0_id="auth0|123456789").first()
        assert user is not None

    @patch("auth.auth.verify_decode_jwt")
    def test_sync_user_existing_user(self, mock_verify, client, db):
        """Test sync endpoint returns existing user"""
        # Create a user first
        user = User(auth0_id="auth0|987654321", username="testuser")
        db.session.add(user)
        db.session.commit()
        
        # Mock auth
        mock_verify.return_value = {"sub": "auth0|987654321"}
        
        response = client.post(
            "/api/user/sync-user",
            headers={"Authorization": "Bearer test-token"},
            json={},
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["auth0_id"] == "auth0|987654321"
        assert data["username"] == "testuser"
        assert data["is_new"] is False


class TestGetUserEndpoint:
    """Tests for GET /api/user/user/<user_id>"""

    @patch("auth.auth.verify_decode_jwt")
    def test_get_user_success(self, mock_verify, client, db):
        """Test retrieving user information"""
        # Create a test user
        user = User(auth0_id="auth0|111111", username="retrievetest")
        # Add email attribute dynamically since it may not exist in the model
        user.email = None
        db.session.add(user)
        db.session.commit()
        
        # Mock auth
        mock_verify.return_value = {"sub": "auth0|111111"}
        
        response = client.get(
            f"/api/user/user/{user.id}",
            headers={"Authorization": "Bearer test-token"},
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["user_id"] == user.id
        assert data["username"] == "retrievetest"

    @patch("auth.auth.verify_decode_jwt")
    def test_get_user_not_found(self, mock_verify, client):
        """Test retrieving non-existent user"""
        mock_verify.return_value = {"sub": "auth0|111111"}
        
        response = client.get(
            "/api/user/user/9999",
            headers={"Authorization": "Bearer test-token"},
        )
        
        assert response.status_code == 404
        data = response.get_json()
        assert "error" in data
        assert data["error"] == "User not found"
