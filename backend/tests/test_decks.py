"""
Tests for deck endpoints - testing actual route functions.
"""
import pytest


class TestDeckEndpoints:
    """Integration tests for deck endpoints"""

    def test_create_deck(self, client, app, cleanup_db):
        """Test creating a new deck."""
        with app.app_context():
            deck_data = {
                'user_id': 'google-oauth2|123456789',
                'name': 'Test Deck',
                'format': 'Competitive',
                'deck_data': {'Legend': 'OGN-001', 'Main': {}, 'Side': {}}
            }
            
            response = client.post(
                "/api/decks/",
                json=deck_data
            )
            assert response.status_code == 201
            data = response.get_json()
            assert "message" in data
            assert "id" in data

    def test_get_user_decks(self, client, app, cleanup_db):
        """Test getting decks for a user."""
        with app.app_context():
            # Create a couple decks
            for i in range(2):
                client.post(
                    "/api/decks/",
                    json={
                        'user_id': 'google-oauth2|123456789',
                        'name': f'Test Deck {i+1}',
                        'format': 'Competitive',
                        'deck_data': {}
                    }
                )
            
            response = client.get("/api/decks/user/google-oauth2|123456789")
            assert response.status_code == 200
            data = response.get_json()
            assert len(data) == 2

    def test_get_deck_by_id(self, client, app, cleanup_db):
        """Test retrieving a specific deck."""
        with app.app_context():
            # Create a deck
            response = client.post(
                "/api/decks/",
                json={
                    'user_id': 'google-oauth2|123456789',
                    'name': 'Test Deck',
                    'format': 'Competitive',
                    'deck_data': {}
                }
            )
            assert response.status_code == 201
            deck_id = response.get_json()['id']
            
            # Get the deck
            response = client.get(f"/api/decks/{deck_id}")
            assert response.status_code == 200
            data = response.get_json()
            assert data['name'] == 'Test Deck'

    def test_get_deck_not_found(self, client, cleanup_db):
        """Test getting non-existent deck returns 404."""
        response = client.get(f"/api/decks/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404
        data = response.get_json()
        assert "error" in data
