-- StackPulse Initial PostgreSQL Schema DDL
-- Creates core tables, foreign keys, cascading constraints, and performance indexes.

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "developers" (
    "id" TEXT PRIMARY KEY,
    "github_username" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "avatar_url" TEXT NOT NULL,
    "bio" TEXT,
    "company" TEXT,
    "location" TEXT,
    "blog" TEXT,
    "twitter_username" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "public_repos" INTEGER NOT NULL DEFAULT 0,
    "public_gists" INTEGER NOT NULL DEFAULT 0,
    "total_stars" INTEGER NOT NULL DEFAULT 0,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_developers_github_username" ON "developers"("github_username");

CREATE TABLE IF NOT EXISTS "repos" (
    "id" TEXT PRIMARY KEY,
    "developer_id" TEXT NOT NULL,
    "github_repo_id" INTEGER,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "description" TEXT,
    "html_url" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "watchers" INTEGER NOT NULL DEFAULT 0,
    "open_issues" INTEGER NOT NULL DEFAULT 0,
    "primary_language" TEXT,
    "default_branch" TEXT NOT NULL DEFAULT 'main',
    "is_fork" BOOLEAN NOT NULL DEFAULT false,
    "pushed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_repos_developer" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_repos_developer_id" ON "repos"("developer_id");
CREATE INDEX IF NOT EXISTS "idx_repos_stars" ON "repos"("stars" DESC);
CREATE INDEX IF NOT EXISTS "idx_repos_primary_language" ON "repos"("primary_language");

CREATE TABLE IF NOT EXISTS "repository_languages" (
    "id" TEXT PRIMARY KEY,
    "repository_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    CONSTRAINT "fk_repo_lang_repo" FOREIGN KEY ("repository_id") REFERENCES "repos"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_repo_languages_repo_id" ON "repository_languages"("repository_id");
CREATE INDEX IF NOT EXISTS "idx_repo_languages_language" ON "repository_languages"("language");

CREATE TABLE IF NOT EXISTS "comparisons" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_comparisons_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_comparisons_user_id" ON "comparisons"("user_id");

CREATE TABLE IF NOT EXISTS "comparison_devs" (
    "id" TEXT PRIMARY KEY,
    "comparison_id" TEXT NOT NULL,
    "developer_id" TEXT NOT NULL,
    CONSTRAINT "fk_comp_devs_comparison" FOREIGN KEY ("comparison_id") REFERENCES "comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_comp_devs_developer" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "uq_comparison_developer" UNIQUE ("comparison_id", "developer_id")
);

CREATE INDEX IF NOT EXISTS "idx_comp_devs_comp_id" ON "comparison_devs"("comparison_id");
CREATE INDEX IF NOT EXISTS "idx_comp_devs_dev_id" ON "comparison_devs"("developer_id");

CREATE TABLE IF NOT EXISTS "pins" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "repository_id" TEXT NOT NULL,
    "note" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_pins_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_pins_repository" FOREIGN KEY ("repository_id") REFERENCES "repos"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "uq_user_repository_pin" UNIQUE ("user_id", "repository_id")
);

CREATE INDEX IF NOT EXISTS "idx_pins_user_id" ON "pins"("user_id");
CREATE INDEX IF NOT EXISTS "idx_pins_repository_id" ON "pins"("repository_id");
