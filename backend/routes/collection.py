from flask import Blueprint, request, jsonify
from sqlalchemy.orm.attributes import flag_modified
from database.db import db
from models.user import User

collection_routes = Blueprint("collection", __name__, url_prefix="/api/collection")

@collection_routes.route("/<int:user_id>", methods=["GET"])
def get_user_collection(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.collection)

@collection_routes.route("/<int:user_id>", methods=["PATCH"])
def update_user_collection(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    card_id = str(data.get("card_id"))
    delta = int(data.get("delta", 1))

    collection = user.collection or {}
    current_count = collection.get(card_id, 0)
    new_count = max(0, current_count + delta)
    
    if new_count == 0:
        if card_id in collection:
            del collection[card_id]
    else:
        collection[card_id] = new_count

    print(collection)

    user.collection = collection
    flag_modified(user, "collection")
    db.session.commit()
    return jsonify(user.collection)