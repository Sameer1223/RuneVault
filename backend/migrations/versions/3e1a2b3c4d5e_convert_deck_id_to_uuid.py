"""convert_deck_id_to_uuid

Revision ID: 3e1a2b3c4d5e
Revises: 8d468cd65a21
Create Date: 2026-04-07 15:24:17.131251

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3e1a2b3c4d5e'
down_revision = '8d468cd65a21'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Add uuid column as nullable
    op.add_column('decks', sa.Column('uuid', sa.UUID(), nullable=True))
    
    # 2. Populate uuid column with random UUIDs
    # We use a raw SQL execution to generate UUIDs for existing rows
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('UPDATE decks SET uuid = uuid_generate_v4()')
    
    # 3. Make uuid column non-nullable
    op.alter_column('decks', 'uuid', nullable=False)
    
    # 4. Drop the old integer primary key
    # First, drop any constraints that may depend on it. 
    # Usually it's just 'decks_pkey'.
    op.drop_constraint('decks_pkey', 'decks', type_='primary')
    
    # 5. Rename uuid to id and make it the primary key
    op.drop_column('decks', 'id')
    op.alter_column('decks', 'uuid', new_column_name='id')
    op.create_primary_key('decks_pkey', 'decks', ['id'])


def downgrade():
    # This is a complex downgrade as we'd lose the original integer IDs 
    # unless we stored them. For now, we'll just implement a simple revert 
    # that adds back an integer ID, but it won't be the same as before.
    op.drop_constraint('decks_pkey', 'decks', type_='primary')
    op.alter_column('decks', 'id', new_column_name='uuid')
    op.add_column('decks', sa.Column('id', sa.Integer(), autoincrement=True))
    op.create_primary_key('decks_pkey', 'decks', ['id'])
    op.drop_column('decks', 'uuid')
