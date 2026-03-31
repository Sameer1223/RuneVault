"""
Pytest configuration and fixtures for RuneVault backend tests.
"""
import os
import sys
import pytest

# Add backend directory to path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + "/..")

from app import create_app
from database.db import db as _db


@pytest.fixture(scope="function")
def app():
    """Create and configure a test Flask app."""
    # Set test config
    os.environ["FLASK_ENV"] = "testing"
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["AUTH0_DOMAIN"] = "test-domain.auth0.com"
    os.environ["AUTH0_API_AUDIENCE"] = "http://localhost:5000"
    
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client for the app."""
    return app.test_client()


@pytest.fixture
def db(app):
    """Provide database session for tests."""
    with app.app_context():
        yield _db


@pytest.fixture
def auth_header():
    """
    Mock authorization header.
    In real tests, you'd use a valid JWT token or mock the auth decorator.
    """
    return {"Authorization": "Bearer test-token"}
