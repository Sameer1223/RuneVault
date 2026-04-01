"""
Pytest configuration for RuneVault backend tests.
Sets up Flask app with in-memory SQLite database for testing.
"""
import os
import pytest
import sys
from pathlib import Path
from functools import wraps

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Set test environment before creating app
os.environ["FLASK_ENV"] = "testing"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["AUTH0_DOMAIN"] = "test.auth0.com"
os.environ["AUTH0_API_AUDIENCE"] = "http://localhost:5000"

# Register SQLite JSON type handler BEFORE importing any models
from sqlalchemy import TypeDecorator, JSON, event
from sqlalchemy.engine import Engine
from sqlalchemy.dialects.sqlite import JSON as SQLITE_JSON

class JSONB(TypeDecorator):
    """Custom type that handles JSONB for PostgreSQL and JSON for SQLite."""
    impl = JSON
    cache_ok = True
    
    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            from sqlalchemy.dialects.postgresql import JSONB as PG_JSONB
            return dialect.type_descriptor(PG_JSONB())
        return dialect.type_descriptor(SQLITE_JSON())

# Monkey-patch the PostgreSQL JSONB type to use our custom one
import sqlalchemy.dialects.postgresql
sqlalchemy.dialects.postgresql.JSONB = JSONB

def mock_requires_auth(f):
    """Mock requires_auth decorator that injects test user data."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        from flask import request
        # Inject mock user data into request object  
        if not hasattr(request, 'user'):
            request.user = {
                "sub": "google-oauth2|123456789",
                "email": "test@example.com"
            }
        return f(*args, **kwargs)
    return wrapper


@pytest.fixture(scope="session", autouse=True)
def apply_mocks():
    """Apply mocks globally for entire test session."""
    from unittest.mock import patch
    
    # Create patches that will be used for the entire session
    patches = [
        patch('auth.auth.requires_auth', mock_requires_auth),
        patch('routes.decks.requires_auth', mock_requires_auth),
        patch('routes.users.requires_auth', mock_requires_auth),
    ]
    
    for p in patches:
        p.start()
    
    yield  # Run tests while patches are active
    
    for p in patches:
        p.stop()


@pytest.fixture(scope="session")
def app():
    """Create and configure test Flask app (created once per session)."""
    from app import create_app
    from database.db import db
    
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        yield app
        # Cleanup
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Flask test client fixture."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Flask CLI runner fixture."""
    return app.test_cli_runner()


@pytest.fixture
def db_session(app):
    """Database session for tests."""
    from database.db import db
    
    with app.app_context():
        yield db.session
        # Rollback after each test
        db.session.rollback()


@pytest.fixture
def cleanup_db(app):
    """Cleanup database before each test.""" 
    from database.db import db
    from models.user import User
    from models.deck import Deck
    
    with app.app_context():
        # Clear all data before test
        User.query.delete()
        Deck.query.delete()
        db.session.commit()
    
    yield  # Run test
    
    with app.app_context():
        # Clear all data after test
        User.query.delete()
        Deck.query.delete()
        db.session.commit()