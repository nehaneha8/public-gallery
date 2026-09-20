-- Run this once against the Vercel Postgres database attached to this
-- project (Vercel dashboard → Storage → your Postgres store → Query tab,
-- paste and run this whole file) before the /api routes will work.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS about_sections (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  opted_in BOOLEAN NOT NULL DEFAULT false,
  photo_url TEXT,
  prompts JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS artworks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  size_category TEXT NOT NULL CHECK (size_category IN ('small', 'medium', 'large')),
  image_url TEXT NOT NULL,
  aspect_ratio REAL NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sketches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS artworks_user_id_idx ON artworks(user_id, sort_order);
CREATE INDEX IF NOT EXISTS sketches_user_id_idx ON sketches(user_id, sort_order);
