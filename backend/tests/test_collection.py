"""
Tests for collection endpoints (/api/collection).
"""
import pytest
from models.user import User


class TestGetUserCollectionEndpoint:
    """Tests for GET /api/collection/<user_id>"""

    def test_get_collection_success(self, client, db):
        """Test retrieving user collection"""
        # Create user with collection
        user = User(
            auth0_id="auth0|collector",
            username="collector",
            collection={"OGN-001": 2, "OGN-002": 1},
            foil_collection={"OGN-001": 1},
        )
        db.session.add(user)
        db.session.commit()
        
        response = client.get("/api/collection/auth0|collector")
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["collection"] == {"OGN-001": 2, "OGN-002": 1}
        assert data["foil_collection"] == {"OGN-001": 1}

    def test_get_collection_empty(self, client, db):
        """Test retrieving collection for user with no cards"""
        user = User(auth0_id="auth0|newcollector", username="newcollector")
        db.session.add(user)
        db.session.commit()
        
        response = client.get("/api/collection/auth0|newcollector")
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["collection"] == {}
        assert data["foil_collection"] == {}

    def test_get_collection_user_not_found(self, client):
        """Test retrieving collection for non-existent user"""
        response = client.get("/api/collection/auth0|nouser")
        
        assert response.status_code == 404
        data = response.get_json()
        assert data["error"] == "User not found"


class TestUpdateUserCollectionEndpoint:
    """Tests for PATCH /api/collection/<user_id>"""

    def test_add_card_to_collection(self, client, db):
        """Test adding a card to collection"""
        user = User(auth0_id="auth0|updater", username="updater")
        db.session.add(user)
        db.session.commit()
        
        response = client.patch(
            "/api/collection/auth0|updater",
            json={"card_id": "OGN-001", "delta": 1, "is_foil": False},
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["collection"]["OGN-001"] == 1

    def test_add_multiple_copies_of_card(self, client, db):
        """Test adding multiple copies of the same card"""
        user = User(auth0_id="auth0|multi", username="multi", collection={"OGN-001": 1})
        db.session.add(user)
        db.session.commit()
        
        response = client.patch(
            "/api/collection/auth0|multi",
            json={"card_id": "OGN-001", "delta": 2, "is_foil": False},
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["collection"]["OGN-001"] == 3

    def test_remove_card_from_collection(self, client, db):
        """Test removing cards from collection"""
        user = User(
            auth0_id="auth0|remover",
            username="remover",
            collection={"OGN-001": 2, "OGN-002": 1},
        )
        db.session.add(user)
        db.session.commit()
        
        response = client.patch(
            "/api/collection/auth0|remover",
            json={"card_id": "OGN-001", "delta": -1, "is_foil": False},
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["collection"]["OGN-001"] == 1

    def test_remove_all_copies_deletes_entry(self, client, db):
        """Test that removing all copies removes the entry"""
        user = User(
            auth0_id="auth0|remover2",
            username="remover2",
            collection={"OGN-001": 1},
        )
        db.session.add(user)
        db.session.commit()
        
        response = client.patch(
            "/api/collection/auth0|remover2",
            json={"card_id": "OGN-001", "delta": -1, "is_foil": False},
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert "OGN-001" not in data["collection"]

    def test_prevent_negative_count(self, client, db):
        """Test that collection count never goes below 0"""
        user = User(auth0_id="auth0|tester", username="tester", collection={"OGN-001": 1})
        db.session.add(user)
        db.session.commit()
        
        response = client.patch(
            "/api/collection/auth0|tester",
            json={"card_id": "OGN-001", "delta": -5, "is_foil": False},
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert "OGN-001" not in data["collection"]

    def test_add_foil_card(self, client, db):
        """Test adding foil cards to collection"""
        user = User(auth0_id="auth0|foiluser", username="foiluser")
        db.session.add(user)
        db.session.commit()
        
        response = client.patch(
            "/api/collection/auth0|foiluser",
            json={"card_id": "OGN-001", "delta": 1, "is_foil": True},
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["foil_collection"]["OGN-001"] == 1
        assert "OGN-001" not in data["collection"]

    def test_update_collection_user_not_found(self, client):
        """Test updating collection for non-existent user"""
        response = client.patch(
            "/api/collection/auth0|nouser",
            json={"card_id": "OGN-001", "delta": 1, "is_foil": False},
        )
        
        assert response.status_code == 404
        data = response.get_json()
        assert data["error"] == "User not found"

    def test_mixed_collection_and_foil(self, client, db):
        """Test user having both regular and foil versions of a card"""
        user = User(
            auth0_id="auth0|mixed",
            username="mixed",
            collection={"OGN-001": 2},
            foil_collection={"OGN-001": 1},
        )
        db.session.add(user)
        db.session.commit()
        
        response = client.get("/api/collection/auth0|mixed")
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["collection"]["OGN-001"] == 2
        assert data["foil_collection"]["OGN-001"] == 1
