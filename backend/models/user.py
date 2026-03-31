from database.db import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    auth0_id = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), nullable=True)
    collection = db.Column(db.JSON, nullable=False, default=dict)
    foil_collection = db.Column(db.JSON, nullable=False, default=dict)

    decks = db.relationship("Deck", backref="user", lazy=True)