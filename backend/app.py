from flask import Flask
from flask_cors import CORS
from database.db import db, migrate
from routes import register_routes
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)

    register_routes(app)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
