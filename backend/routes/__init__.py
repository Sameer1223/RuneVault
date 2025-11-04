from .decks import decks_routes

def register_routes(app):
    app.register_blueprint(decks_routes)
