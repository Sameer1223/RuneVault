from .decks import decks_routes
from .collection import collection_routes
from .users import user_routes

def register_routes(app):
    app.register_blueprint(decks_routes)
    app.register_blueprint(collection_routes)
    app.register_blueprint(user_routes)
