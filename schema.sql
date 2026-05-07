-- ============================================================
-- The Gym Success Plan — Cloudflare D1 (SQLite) schema
-- Apply with:
--   npx wrangler d1 execute gym-success-plan --remote --file=schema.sql
-- For local dev:
--   npx wrangler d1 execute gym-success-plan --local  --file=schema.sql
-- ============================================================

PRAGMA foreign_keys = ON;

-- ---------------- USERS ----------------
CREATE TABLE IF NOT EXISTS users (
  id                    TEXT PRIMARY KEY,
  email                 TEXT UNIQUE NOT NULL,
  password_hash         TEXT NOT NULL,
  password_salt         TEXT NOT NULL,
  name                  TEXT,
  goal                  TEXT CHECK (goal IN ('cut','maintain','bulk')),
  weight                REAL,
  height                REAL,
  experience            TEXT,
  bmr                   REAL,
  calorie_target        REAL,
  subscription_status   TEXT CHECK (subscription_status IN ('active','expired','none')) DEFAULT 'none',
  subscription_expires  TEXT,
  stripe_customer_id    TEXT,
  current_streak        INTEGER DEFAULT 0,
  longest_streak        INTEGER DEFAULT 0,
  last_workout_date     TEXT,
  pwa_installed         INTEGER DEFAULT 0,
  onboarded             INTEGER DEFAULT 0,
  created_at            TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ---------------- WORKOUTS ----------------
CREATE TABLE IF NOT EXISTS workouts (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_number        INTEGER CHECK (day_number BETWEEN 1 AND 4),
  day_name          TEXT,
  completed_at      TEXT DEFAULT CURRENT_TIMESTAMP,
  duration_minutes  INTEGER,
  notes             TEXT
);
CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id, completed_at DESC);

-- ---------------- SETS ----------------
CREATE TABLE IF NOT EXISTS sets (
  id            TEXT PRIMARY KEY,
  workout_id    TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  set_number    INTEGER,
  weight        REAL,
  reps          INTEGER,
  is_drop_set   INTEGER DEFAULT 0,
  is_pr         INTEGER DEFAULT 0,
  completed_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sets_workout  ON sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise ON sets(exercise_name);

-- ---------------- PERSONAL RECORDS ----------------
CREATE TABLE IF NOT EXISTS personal_records (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight        REAL NOT NULL,
  reps          INTEGER NOT NULL,
  achieved_at   TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pr_user ON personal_records(user_id, achieved_at DESC);

-- ---------------- BODY WEIGHT LOG ----------------
CREATE TABLE IF NOT EXISTS body_weight_log (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight    REAL NOT NULL,
  logged_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bw_user ON body_weight_log(user_id, logged_at DESC);

-- ---------------- NUTRITION LOG ----------------
CREATE TABLE IF NOT EXISTS nutrition_log (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories  INTEGER DEFAULT 0,
  protein   REAL DEFAULT 0,
  carbs     REAL DEFAULT 0,
  fats      REAL DEFAULT 0,
  logged_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_nutrition_user ON nutrition_log(user_id, logged_at DESC);

-- ---------------- COMMUNITY POSTS ----------------
CREATE TABLE IF NOT EXISTS community_posts (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name   TEXT,
  content     TEXT NOT NULL,
  likes       INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts(created_at DESC);

-- ---------------- COMMUNITY COMMENTS ----------------
CREATE TABLE IF NOT EXISTS community_comments (
  id          TEXT PRIMARY KEY,
  post_id     TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name   TEXT,
  content     TEXT NOT NULL,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_comments_post ON community_comments(post_id, created_at);

-- ---------------- PROGRESS PHOTOS ----------------
-- photo_url stores either a data: URL (base64) or an R2/CDN URL.
CREATE TABLE IF NOT EXISTS progress_photos (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  notes     TEXT,
  taken_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_photos_user ON progress_photos(user_id, taken_at DESC);
