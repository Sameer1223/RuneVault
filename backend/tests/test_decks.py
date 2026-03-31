"""
Tests for deck endpoints (/api/decks).
"""
import pytest
from unittest.mock import patch
from models.deck import Deck
from models.user import User


class TestCreateDeckEndpoint:
    """Tests for POST /api/decks"""

    @patch("auth.auth.verify_decode_jwt")
    def test_create_deck_success(self, mock_verify, client, db):
        """Test creating a new deck"""
        # Create user first to satisfy foreign key constraint
        user = User(auth0_id="auth0|decktest", username="decktest_user")
        db.session.add(user)
        db.session.commit()
        
        mock_verify.return_value = {"sub": "auth0|decktest"}
        
        deck_data = {
            "user_id": "auth0|decktest",
            "name": "Test Deck",
            "format": "Competitive",
            "deck_data": {"Legend": "OGN-001", "Main": {}, "Side": {}, "Runes": {}},
        }
        
        response = client.post(
            "/api/decks/",
            headers={"Authorization": "Bearer test-token"},
            json=deck_data,
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data["message"] == "Deck created."
        assert "id" in data
        
        # Verify deck was created
        deck = Deck.query.get(data["id"])
        assert deck is not None
        assert deck.name == "Test Deck"
        assert deck.user_id == "auth0|decktest"

    @patch("auth.auth.verify_decode_jwt")
    def test_create_deck_missing_fields(self, mock_verify, client, db):
        """Test creating deck with missing required fields"""
        # Create user first
        user = User(auth0_id="auth0|decktest2", username="decktest_user2")
        db.session.add(user)
        db.session.commit()
        
        mock_verify.return_value = {"sub": "auth0|decktest2"}
        
        response = client.post(
            "/api/decks/",
            headers={"Authorization": "Bearer test-token"},
            json={"name": "Incomplete Deck"},
        )
        
        assert response.status_code == 400


class TestGetDecksByUserEndpoint:
    """Tests for GET /api/decks/user/<user_id>"""

    def test_get_decks_by_user_empty(self, client, db):
        """Test getting decks for user with no decks"""
        response = client.get("/api/decks/user/auth0|nodecks")
        
        assert response.status_code == 200
        data = response.get_json()
        assert data == []

    def test_get_decks_by_user_success(self, client, db):
        """Test retrieving user's decks"""
        # Create user first to satisfy foreign key constraint
        user = User(auth0_id="auth0|deckuser", username="deckuser_user")
        db.session.add(user)
        db.session.commit()
        
        # Create test decks
        deck1 = Deck(
            user_id="auth0|deckuser",
            name="Deck 1",
            format="Competitive",
            deck_data={"Legend": "OGN-001"},
        )
        deck2 = Deck(
            user_id="auth0|deckuser",
            name="Deck 2",
            format="Casual",
            deck_data={"Legend": "OGN-002"},
        )
        db.session.add(deck1)
        db.session.add(deck2)
        db.session.commit()
        
        response = client.get("/api/decks/user/auth0|deckuser")
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 2
        assert data[0]["name"] == "Deck 1"
        assert data[1]["name"] == "Deck 2"


class TestGetDeckByIdEndpoint:
    """Tests for GET /api/decks/<deck_id>"""

    def test_get_deck_by_id_success(self, client, db):
        """Test retrieving a specific deck"""
        # Create user first
        user = User(auth0_id="auth0|deckowner", username="deckowner_user")
        db.session.add(user)
        db.session.commit()
        
        deck = Deck(
            user_id="auth0|deckowner",
            name="My Deck",
            format="Competitive",
            deck_data={"Legend": "OGN-001"},
        )
        db.session.add(deck)
        db.session.commit()
        
        response = client.get(f"/api/decks/{deck.id}")
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["id"] == deck.id
        assert data["name"] == "My Deck"

    def test_get_deck_not_found(self, client):
        """Test retrieving non-existent deck"""
        response = client.get("/api/decks/9999")
        
        assert response.status_code == 404
        data = response.get_json()
        assert data["error"] == "Deck not found."


class TestUpdateDeckEndpoint:
    """Tests for PUT /api/decks/<deck_id>"""

    @patch("auth.auth.verify_decode_jwt")
    def test_update_deck_success(self, mock_verify, client, db):
        """Test updating a deck"""
        # Create user first
        user = User(auth0_id="auth0|deckowner", username="deckowner_user")
        db.session.add(user)
        db.session.commit()
        
        mock_verify.return_value = {"sub": "auth0|deckowner"}
        
        # Create deck
        deck = Deck(
            user_id="auth0|deckowner",
            name="Original Name",
            format="Competitive",
            deck_data={"Legend": "OGN-001"},
        )
        db.session.add(deck)
        db.session.commit()
        
        response = client.put(
            f"/api/decks/{deck.id}",
            headers={"Authorization": "Bearer test-token"},
            json={"name": "Updated Name", "format": "Casual"},
        )
        
        assert response.status_code == 200
        
        # Verify update
        updated_deck = Deck.query.get(deck.id)
        assert updated_deck.name == "Updated Name"
        assert updated_deck.format == "Casual"

    @patch("auth.auth.verify_decode_jwt")
    def test_update_deck_unauthorized(self, mock_verify, client, db):
        """Test updating deck owned by another user"""
        # Create user first
        user1 = User(auth0_id="auth0|deckowner", username="deckowner_user")
        user2 = User(auth0_id="auth0|hacker", username="hacker_user")
        db.session.add_all([user1, user2])
        db.session.commit()
        
        mock_verify.return_value = {"sub": "auth0|hacker"}
        
        # Create deck owned by different user
        deck = Deck(
            user_id="auth0|deckowner",
            name="Protected Deck",
            format="Competitive",
            deck_data={"Legend": "OGN-001"},
        )
        db.session.add(deck)
        db.session.commit()
        
        response = client.put(
            f"/api/decks/{deck.id}",
            headers={"Authorization": "Bearer test-token"},
            json={"name": "Hacked Name"},
        )
        
        assert response.status_code == 403
        data = response.get_json()
        assert "Unauthorized" in data["error"]


class TestDeleteDeckEndpoint:
    """Tests for DELETE /api/decks/<deck_id>"""

    @patch("auth.auth.verify_decode_jwt")
    def test_delete_deck_success(self, mock_verify, client, db):
        """Test deleting a deck"""
        # Create user first
        user = User(auth0_id="auth0|deckowner", username="deckowner_user")
        db.session.add(user)
        db.session.commit()
        
        mock_verify.return_value = {"sub": "auth0|deckowner"}
        
        # Create deck
        deck = Deck(
            user_id="auth0|deckowner",
            name="Deck to Delete",
            format="Competitive",
            deck_data={"Legend": "OGN-001"},
        )
        db.session.add(deck)
        db.session.commit()
        deck_id = deck.id
        
        response = client.delete(
            f"/api/decks/{deck_id}",
            headers={"Authorization": "Bearer test-token"},
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["message"] == "Deck deleted."
        
        # Verify deletion
        deleted_deck = Deck.query.get(deck_id)
        assert deleted_deck is None

    @patch("auth.auth.verify_decode_jwt")
    def test_delete_deck_unauthorized(self, mock_verify, client, db):
        """Test deleting deck owned by another user"""
        # Create users first
        user1 = User(auth0_id="auth0|deckowner", username="deckowner_user")
        user2 = User(auth0_id="auth0|hacker", username="hacker_user")
        db.session.add_all([user1, user2])
        db.session.commit()
        
        mock_verify.return_value = {"sub": "auth0|hacker"}
        
        # Create deck owned by different user
        deck = Deck(
            user_id="auth0|deckowner",
            name="Protected Deck",
            format="Competitive",
            deck_data={"Legend": "OGN-001"},
        )
        db.session.add(deck)
        db.session.commit()
        
        response = client.delete(
            f"/api/decks/{deck.id}",
            headers={"Authorization": "Bearer test-token"},
        )
        
        assert response.status_code == 403
        data = response.get_json()
        assert "Unauthorized" in data["error"]
