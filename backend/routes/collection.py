from flask import Blueprint, request, jsonify
from sqlalchemy.orm.attributes import flag_modified
from database.db import db
from models.user import User

collection_routes = Blueprint("collection", __name__, url_prefix="/api/collection")

@collection_routes.route("/<string:user_id>", methods=["GET"])
def get_user_collection(user_id):
    user = User.query.filter_by(auth0_id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "collection": user.collection,
        "foil_collection": user.foil_collection
    })

@collection_routes.route("/<string:user_id>", methods=["PATCH"])
def update_user_collection(user_id):
    # Locks the row for the duration of this transaction so concurrent PATCHes
    # (e.g. rapid clicking) serialize instead of racing on a read-modify-write
    # of the same JSON column, which would silently lose increments.
    user = User.query.filter_by(auth0_id=user_id).with_for_update().first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    card_id = str(data.get("card_id"))
    delta = int(data.get("delta", 1))
    is_foil = data.get("is_foil", False)

    if is_foil:
        foil_collection = user.foil_collection or {}
        current_count = foil_collection.get(card_id, 0)
        new_count = max(0, current_count + delta)

        if new_count == 0:
            if card_id in foil_collection:
                del foil_collection[card_id]
        else:
            foil_collection[card_id] = new_count

        user.foil_collection = foil_collection
        flag_modified(user, "foil_collection")
    else:
        collection = user.collection or {}
        current_count = collection.get(card_id, 0)
        new_count = max(0, current_count + delta)

        if new_count == 0:
            if card_id in collection:
                del collection[card_id]
        else:
            collection[card_id] = new_count

        user.collection = collection
        flag_modified(user, "collection")

    db.session.commit()
    return jsonify({
        "collection": user.collection,
        "foil_collection": user.foil_collection
    })