from flask import Blueprint, request, jsonify
from database.db import db
from models.deck import Deck
from auth.auth import requires_auth, get_current_user

decks_routes = Blueprint("decks", __name__, url_prefix="/api/decks")

# Create a new deck
@decks_routes.route("/", methods=["POST"])
@requires_auth
def create_deck():
    data = request.get_json()
    try:
        new_deck = Deck(
            user_id=data["user_id"],
            name=data["name"],
            format=data.get("format") or "Competitive",
            deck_data=data["deck_data"]
        )
        db.session.add(new_deck)
        db.session.commit()
        return jsonify({"message": "Deck created.", "id": str(new_deck.id)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    

# Get decks by user ID
@decks_routes.route("/user/<string:user_id>", methods=["GET"])
@requires_auth
def get_decks_by_user(user_id):
    # Users can only see their own decks list
    if user_id != request.user['sub']:
        return jsonify({"error": "Unauthorized. You can only view your own decks."}), 403
    
    decks = Deck.query.filter_by(user_id=user_id).all()
    return jsonify([deck.to_dict() for deck in decks]), 200


# Get deck by ID
@decks_routes.route("/<string:deck_id>", methods=["GET"])
def get_deck(deck_id):
    try:
        deck = Deck.query.filter_by(id=deck_id).first()
        if not deck:
            return jsonify({"error": "Deck not found."}), 404
        
        # Allow public viewing of decks - anyone can view shared decks
        return jsonify(deck.to_dict()), 200
    except Exception as e:
        return jsonify({"error": "Invalid deck ID."}), 400


# Update a deck
@decks_routes.route("/<string:deck_id>", methods=["PUT"])
@requires_auth
def update_deck(deck_id):
    data = request.get_json()
    try:
        deck = Deck.query.filter_by(id=deck_id).first()
        if not deck:
            return jsonify({"error": "Deck not found."}), 404
        
        # Verify ownership
        if deck.user_id != request.user['sub']:
            return jsonify({"error": "Unauthorized. You can only edit your own decks."}), 403
        
        deck.name = data.get("name", deck.name)
        deck.format = data.get("format", deck.format)
        deck.deck_data = data.get("deck_data", deck.deck_data)
        db.session.commit()
        return jsonify({"message": "Deck updated."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Delete a deck
@decks_routes.route("/<string:deck_id>", methods=["DELETE"])
@requires_auth
def delete_deck(deck_id):
    try:
        deck = Deck.query.filter_by(id=deck_id).first()
        if not deck:
            return jsonify({"error": "Deck not found."}), 404
        
        # Verify ownership
        if deck.user_id != request.user['sub']:
            return jsonify({"error": "Unauthorized. You can only delete your own decks."}), 403
        
        db.session.delete(deck)
        db.session.commit()
        return jsonify({"message": "Deck deleted."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400