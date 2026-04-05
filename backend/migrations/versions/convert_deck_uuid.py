"""Convert deck id from Integer to UUID

Revision ID: convert_deck_uuid
Revises: 8d468cd65a21
Create Date: 2026-04-05 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'convert_deck_uuid'
down_revision = '8d468cd65a21'
branch_labels = None
depends_on = None


def upgrade():
    # Add new UUID column with auto-generated UUIDs
    op.execute('ALTER TABLE decks ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid() NOT NULL')
    
    # Drop the foreign key constraint
    op.execute('ALTER TABLE decks DROP CONSTRAINT decks_user_id_fkey')
    
    # Drop the primary key
    op.execute('ALTER TABLE decks DROP CONSTRAINT decks_pkey')
    
    # Drop the old id column
    op.execute('ALTER TABLE decks DROP COLUMN id')
    
    # Rename new column to id
    op.execute('ALTER TABLE decks RENAME COLUMN id_uuid TO id')
    
    # Re-add primary key
    op.execute('ALTER TABLE decks ADD PRIMARY KEY (id)')
    
    # Re-add foreign key
    op.execute('ALTER TABLE decks ADD CONSTRAINT decks_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(auth0_id) ON DELETE CASCADE')


def downgrade():
    pass
