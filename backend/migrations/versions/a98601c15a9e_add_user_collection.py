"""add user_collection

Revision ID: a98601c15a9e
Revises: 792d4b6f7c47
Create Date: 2025-12-26 02:21:46.169417

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a98601c15a9e'
down_revision = '792d4b6f7c47'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Add column as nullable
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('collection', sa.JSON(), nullable=True)
        )

    # 2. Backfill existing rows
    op.execute(
        "UPDATE users SET collection = '{}' WHERE collection IS NULL"
    )

    # 3. Enforce NOT NULL
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column(
            'collection',
            nullable=False
        )


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('collection')
