import click
from flask.cli import with_appcontext
from database.db import db

@click.command("reset-db")
@with_appcontext
def reset_db():
    click.echo("Dropping all tables...")
    db.drop_all()
    click.echo("Creating tables...")
    db.create_all()
    click.echo("Database reset complete")
