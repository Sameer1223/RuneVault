"""
Tests for user endpoints - testing actual route functions.
"""
import pytest


class TestUserEndpoints:
    """Integration tests for user endpoints"""

    def test_sync_user_creates_new_user(self, client, app, cleanup_db):
        """Test creating a new user from sync endpoint."""
        with app.app_context():
            response = client.post(
                "/api/user/sync-user",
                json={"email": "test@example.com"}
            )
            assert response.status_code == 201
            data = response.get_json()
            assert data["is_new"] is True
            assert "auth0_id" in data
            assert "username" in data

    def test_sync_user_returns_existing(self, client, app, cleanup_db):
        """Test that existing user is returned with is_new=False."""
        with app.app_context():
            # Create user
            response1 = client.post(
                "/api/user/sync-user",
                json={"email": "test@example.com"}
            )
            assert response1.status_code == 201
            
            # Try to sync again - should return existing user
            response2 = client.post(
                "/api/user/sync-user",
                json={"email": "test@example.com"}
            )
            assert response2.status_code == 200
            data = response2.get_json()
            assert data["is_new"] is False

    def test_get_user_success(self, client, app, cleanup_db):
        """Test getting a user by ID."""
        with app.app_context():
            # Create user first
            response = client.post(
                "/api/user/sync-user",
                json={}
            )
            assert response.status_code == 201
            
            # Get user by ID
            response = client.get("/api/user/user/1")
            assert response.status_code == 200
            data = response.get_json()
            assert data["user_id"] == 1
            assert "username" in data

    def test_get_user_not_found(self, client, cleanup_db):
        """Test that non-existent user returns 404."""
        response = client.get("/api/user/user/9999")
        assert response.status_code == 404
        data = response.get_json()
        assert "error" in data
