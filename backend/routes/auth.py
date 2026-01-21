from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User
from auth.auth import require_auth

auth_routes = Blueprint("auth", __name__, url_prefix="/api/auth")

# Login/Register endpoint
@auth_routes.route("/login", methods=["POST"])
@require_auth
def login():
    """
    Handle user login via Auth0.
    Creates user if they don't exist, updates if they do.
    """
    try:
        user_info = request.user
        auth0_id = user_info.get('sub')  # Auth0 unique identifier
        email = user_info.get('email')
        username = user_info.get('nickname') or user_info.get('name') or email.split('@')[0]
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Update existing user
            user.username = username
            db.session.commit()
        else:
            # Create new user
            user = User(
                username=username,
                email=email
            )
            db.session.add(user)
            db.session.commit()
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Get current user endpoint
@auth_routes.route("/me", methods=["GET"])
@require_auth
def get_current_user():
    """Get the currently authenticated user's info"""
    try:
        email = request.user.get('email')
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400
