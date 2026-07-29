from flask import Blueprint, request, jsonify
from database.db import db
from models.deck import Deck
from auth.auth import requires_auth

decks_routes = Blueprint("decks", __name__, url_prefix="/api/decks")

MAX_DECKS_PER_USER = 50

# Create a new deck
@decks_routes.route("/", methods=["POST"])
@requires_auth
def create_deck():
    data = request.get_json()
    # Use the authenticated caller's own id rather than trusting data["user_id"],
    # otherwise anyone could create decks (and burn the limit) under someone else's account.
    user_id = request.user["sub"]

    try:
        existing_count = Deck.query.filter_by(user_id=user_id).count()
        if existing_count >= MAX_DECKS_PER_USER:
            return jsonify({"error": f"You've reached the limit of {MAX_DECKS_PER_USER} decks. Delete a deck before creating a new one."}), 403

        new_deck = Deck(
            user_id=user_id,
            name=data["name"],
            format=data.get("format") or "Competitive",
            deck_data=data["deck_data"],
            notes=data.get("notes")
        )
        db.session.add(new_deck)
        db.session.commit()
        return jsonify({"message": "Deck created.", "id": new_deck.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    

# Get decks by user ID
@decks_routes.route("/user/<string:user_id>", methods=["GET"])
def get_decks_by_user(user_id):
    decks = Deck.query.filter_by(user_id=user_id).all()
    return jsonify([deck.to_dict() for deck in decks]), 200


# Get deck by ID
@decks_routes.route("/<string:deck_id>", methods=["GET"])
def get_deck(deck_id):
    deck = Deck.query.get(deck_id)
    if not deck:
        return jsonify({"error": "Deck not found."}), 404
    return jsonify(deck.to_dict()), 200


# Update a deck
@decks_routes.route("/<string:deck_id>", methods=["PUT"])
@requires_auth
def update_deck(deck_id):
    data = request.get_json()
    deck = Deck.query.get(deck_id)
    if not deck:
        return jsonify({"error": "Deck not found."}), 404
    
    # Verify ownership
    if deck.user_id != request.user['sub']:
        return jsonify({"error": "Unauthorized. You can only edit your own decks."}), 403
    
    try:
        deck.name = data.get("name", deck.name)
        deck.format = data.get("format", deck.format)
        deck.deck_data = data.get("deck_data", deck.deck_data)
        deck.notes = data.get("notes", deck.notes)
        db.session.commit()
        return jsonify({"message": "Deck updated."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    
# Delete a deck
@decks_routes.route("/<string:deck_id>", methods=["DELETE"])
@requires_auth
def delete_deck(deck_id):
    deck = Deck.query.get(deck_id)
    if not deck:
        return jsonify({"error": "Deck not found."}), 404
    
    # Verify ownership
    if deck.user_id != request.user['sub']:
        return jsonify({"error": "Unauthorized. You can only delete your own decks."}), 403
    
    try:
        db.session.delete(deck)
        db.session.commit()
        return jsonify({"message": "Deck deleted."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400