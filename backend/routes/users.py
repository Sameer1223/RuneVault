from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User
from auth.auth import requires_auth

user_routes = Blueprint("auth", __name__, url_prefix="/api/user")

@user_routes.route("/sync-user", methods=["POST"])
@requires_auth
def sync_user():
    """
    Create or update user in database on first login.
    Called from frontend after Auth0 authentication.
    Expects email in request body.
    """
    try:
        auth0_id = request.user["sub"]

        # Check if user already exists
        existing_user = User.query.filter_by(auth0_id=auth0_id).first()
        if existing_user:
            return jsonify({
                "auth0_id": existing_user.auth0_id,
                "username": existing_user.username,
                "is_new": False
            }), 200

        # Generate a username from the Auth0 sub
        # Example: google-oauth2|123456789 → google_123456789
        provider, unique_id = auth0_id.split("|", 1)
        username = f"{provider}_{unique_id[:8]}"

        new_user = User(
            auth0_id=auth0_id,
            username=username
        )
        
        try:
            db.session.add(new_user)
            db.session.commit()
            
            return jsonify({
                "auth0_id": new_user.auth0_id,
                "username": new_user.username,
                "is_new": True
            }), 201
            
        except Exception as db_error:
            db.session.rollback()
            return jsonify({"error": f"Database error: {str(db_error)}"}), 500
    
    except Exception as e:
        return jsonify({"error": f"Error syncing user: {str(e)}"}), 500

@user_routes.route("/user/<int:user_id>", methods=["GET"])
@requires_auth
def get_user(user_id):
    """Get user information"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "user_id": user.id,
        "username": user.username,
        "email": user.email
    }), 200
