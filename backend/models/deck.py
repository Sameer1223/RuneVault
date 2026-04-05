from database.db import db
from sqlalchemy.dialects.postgresql import JSONB, UUID
from datetime import datetime
import uuid

class Deck(db.Model):
    __tablename__ = "decks"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.VARCHAR(120), db.ForeignKey("users.auth0_id"), nullable=False) # maps to auth sub id

    name = db.Column(db.String(120), nullable=False)
    format = db.Column(db.String(50))

    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    deck_data = db.Column(JSONB, nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "userId": self.user_id,
            "name": self.name,
            "format": self.format,
            "lastUpdated": self.last_updated.isoformat() if self.last_updated else None,
            "deck_data": self.deck_data,
        }
