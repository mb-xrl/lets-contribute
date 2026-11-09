-- Let's Contribute — Neon Postgres schema
-- Apply with: npm run db:setup   (needs DATABASE_URL)
-- Safe to re-run: every statement is idempotent.

CREATE TABLE IF NOT EXISTS users (
  id          text PRIMARY KEY,
  github_id   text UNIQUE,
  login       text NOT NULL UNIQUE,
  name        text NOT NULL,
  avatar_url  text,
  bio         text,
  location    text,
  github_url  text,
  is_demo     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id          text PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text NOT NULL,
  repo_url    text,
  tags        text[] NOT NULL DEFAULT '{}',
  owner_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id          text PRIMARY KEY,
  author_id   text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('opportunity', 'idea', 'discussion')),
  title       text NOT NULL,
  body        text NOT NULL,
  tags        text[] NOT NULL DEFAULT '{}',
  skills      text[] NOT NULL DEFAULT '{}',
  repo_url    text,
  repo_name   text,
  difficulty  text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  project_id  text REFERENCES projects(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes (
  post_id    text NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id         text PRIMARY KEY,
  post_id    text NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id  text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_type_idx      ON posts (type);
CREATE INDEX IF NOT EXISTS posts_author_idx    ON posts (author_id);
CREATE INDEX IF NOT EXISTS posts_project_idx   ON posts (project_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS comments_post_idx   ON comments (post_id);
CREATE INDEX IF NOT EXISTS votes_post_idx      ON votes (post_id);
