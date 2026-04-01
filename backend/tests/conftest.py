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


@pytest.fixture(scope="session")
def app():
    """Create and configure a test Flask app (created once per session)."""
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


@pytest.fixture
def db(app):
    """
    Provide database session for tests with cleanup.
    Database schema is created once per session, data is cleared per test.
    """
    with app.app_context():
        yield _db
        
        # Clear all tables after each test (faster than drop_all + create_all)
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()


@pytest.fixture
def client(app):
    """Create a test client for the app."""
    return app.test_client()


@pytest.fixture
def auth_header():
    """
    Mock authorization header.
    In real tests, you'd use a valid JWT token or mock the auth decorator.
    """
    return {"Authorization": "Bearer test-token"}