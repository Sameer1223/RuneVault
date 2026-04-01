from flask import Flask
from flask_cors import CORS
from database.db import db, migrate
from routes import register_routes
from config import Config
from cli import reset_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, supports_credentials=True, resources={
        r"/api/*": {
            "origins": "*",
            "allow_headers": ["Authorization", "Content-Type"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
        }
    })

    db.init_app(app)
    migrate.init_app(app, db)

    register_routes(app)

    # register CLI command
    app.cli.add_command(reset_db)

    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
