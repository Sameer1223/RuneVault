from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User
from auth.auth import require_auth

user_routes = Blueprint("auth", __name__, url_prefix="/api/user")

@user_routes.route("/sync-user", methods=["POST"])
def sync_user():
    """
    Create or update user in database on first login.
    Called from frontend after Auth0 authentication.
    Expects email in request body.
    """
    try:
        data = request.get_json()
        email = data.get("email")
        
        if not email:
            return jsonify({"error": "Missing email in request"}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        
        if existing_user:
            # User already exists, return their data
            return jsonify({
                "user_id": existing_user.id,
                "username": existing_user.username,
                "email": existing_user.email,
                "is_new": False
            }), 200
        
        # Generate username from email
        username = email.split("@")[0]
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            collection={}
        )
        
        try:
            db.session.add(new_user)
            db.session.commit()
            
            return jsonify({
                "user_id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "is_new": True
            }), 201
            
        except Exception as db_error:
            db.session.rollback()
            return jsonify({"error": f"Database error: {str(db_error)}"}), 500
    
    except Exception as e:
        return jsonify({"error": f"Error syncing user: {str(e)}"}), 500

@user_routes.route("/user/<int:user_id>", methods=["GET"])
@require_auth
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
