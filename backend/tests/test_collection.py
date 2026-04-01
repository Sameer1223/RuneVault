"""
Tests for collection endpoints - testing actual route functions.
"""
import pytest


class TestCollectionEndpoints:
    """Integration tests for collection endpoints"""

    def test_get_collection_success(self, client, app):
        """Test retrieving user collection."""
        with app.app_context():
            # Create a user first
            client.post(
                "/api/user/sync-user",
                json={"email": "test@example.com"}
            )
            
            response = client.get("/api/collection/google-oauth2|123456789")
            assert response.status_code == 200
            data = response.get_json()
            assert "collection" in data
            assert "foil_collection" in data

    def test_get_collection_empty(self, client, app):
        """Test retrieving collection for new user."""
        with app.app_context():
            # Create a user
            client.post(
                "/api/user/sync-user",
                json={"email": "test@example.com"}
            )
            
            response = client.get("/api/collection/google-oauth2|123456789")
            assert response.status_code == 200
            data = response.get_json()
            assert len(data.get("collection", {})) == 0
            assert len(data.get("foil_collection", {})) == 0

    def test_get_collection_user_not_found(self, client):
        """Test that non-existent user returns 404."""
        response = client.get("/api/collection/nonexistent-user")
        assert response.status_code == 404
        data = response.get_json()
        assert "error" in data

    def test_add_card_to_collection(self, client, app):
        """Test adding a card to collection."""
        with app.app_context():
            # Create a user
            client.post(
                "/api/user/sync-user",
                json={"email": "test@example.com"}
            )
            
            # Add a card to collection
            response = client.patch(
                "/api/collection/google-oauth2|123456789",
                json={
                    "card_id": "OGN-001",
                    "delta": 1,
                    "is_foil": False
                }
            )
            assert response.status_code == 200
            data = response.get_json()
            assert data["collection"]["OGN-001"] == 1
