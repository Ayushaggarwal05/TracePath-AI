"""Initial schema migration: User, GitHubConnection, Repository, RepositoryAutomation, Execution

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-16 19:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        "users",
        sa.Column("id", sa.CHAR(36), primary_key=True, nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # 2. github_connections table
    op.create_table(
        "github_connections",
        sa.Column("id", sa.CHAR(36), primary_key=True, nullable=False),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("github_user_id", sa.String(100), nullable=False),
        sa.Column("username", sa.String(150), nullable=False),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("installation_id", sa.String(100), nullable=True),
        sa.Column("access_token_enc", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_github_connections_user_id", "github_connections", ["user_id"])
    op.create_index("ix_github_connections_github_user_id", "github_connections", ["github_user_id"])

    # 3. repositories table
    op.create_table(
        "repositories",
        sa.Column("id", sa.CHAR(36), primary_key=True, nullable=False),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("github_repo_id", sa.String(100), unique=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(510), nullable=False),
        sa.Column("default_branch", sa.String(100), default="main", nullable=False),
        sa.Column("is_private", sa.Boolean(), default=False, nullable=False),
        sa.Column("html_url", sa.String(500), nullable=True),
        sa.Column("description", sa.String(1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_repositories_user_id", "repositories", ["user_id"])
    op.create_index("ix_repositories_github_repo_id", "repositories", ["github_repo_id"])
    op.create_index("ix_repositories_full_name", "repositories", ["full_name"])

    # 4. repository_automations table
    op.create_table(
        "repository_automations",
        sa.Column("id", sa.CHAR(36), primary_key=True, nullable=False),
        sa.Column("repository_id", sa.CHAR(36), sa.ForeignKey("repositories.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("status", sa.String(20), default="INACTIVE", nullable=False),
        sa.Column("target_branch", sa.String(100), default="main", nullable=False),
        sa.Column("doc_paths", sa.JSON(), nullable=True),
        sa.Column("auto_commit", sa.Boolean(), default=False, nullable=False),
        sa.Column("create_pull_request", sa.Boolean(), default=True, nullable=False),
        sa.Column("pr_target_branch", sa.String(100), default="main", nullable=False),
        sa.Column("last_activated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_deactivated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_repository_automations_repository_id", "repository_automations", ["repository_id"])
    op.create_index("ix_repository_automations_status", "repository_automations", ["status"])

    # 5. executions table
    op.create_table(
        "executions",
        sa.Column("id", sa.CHAR(36), primary_key=True, nullable=False),
        sa.Column("repository_id", sa.CHAR(36), sa.ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(50), default="push", nullable=False),
        sa.Column("commit_sha", sa.String(40), nullable=False),
        sa.Column("branch", sa.String(100), default="main", nullable=False),
        sa.Column("status", sa.String(30), default="PENDING", nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completion_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("changed_files", sa.JSON(), nullable=True),
        sa.Column("analysis_result", sa.JSON(), nullable=True),
        sa.Column("documentation_decision", sa.JSON(), nullable=True),
        sa.Column("updated_documents", sa.JSON(), nullable=True),
        sa.Column("generated_diff", sa.Text(), nullable=True),
        sa.Column("final_commit_sha", sa.String(100), nullable=True),
        sa.Column("pull_request_url", sa.String(500), nullable=True),
        sa.Column("error_information", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_executions_repository_id", "executions", ["repository_id"])
    op.create_index("ix_executions_commit_sha", "executions", ["commit_sha"])
    op.create_index("ix_executions_status", "executions", ["status"])


def downgrade() -> None:
    op.drop_table("executions")
    op.drop_table("repository_automations")
    op.drop_table("repositories")
    op.drop_table("github_connections")
    op.drop_table("users")
