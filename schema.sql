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
  age                   INTEGER,
  sex                   TEXT,
  activity_level        TEXT,
  units                 TEXT DEFAULT 'metric',
  water_target_ml       INTEGER DEFAULT 2500,
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
  meal_type TEXT,
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

-- ---------------- BODY MEASUREMENTS ----------------
CREATE TABLE IF NOT EXISTS body_measurements (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chest        REAL,
  waist        REAL,
  hips         REAL,
  left_arm     REAL,
  right_arm    REAL,
  left_thigh   REAL,
  right_thigh  REAL,
  neck         REAL,
  calf         REAL,
  notes        TEXT,
  logged_at    TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_meas_user ON body_measurements(user_id, logged_at DESC);

-- ---------------- WATER LOG ----------------
CREATE TABLE IF NOT EXISTS water_log (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ml        INTEGER NOT NULL,
  logged_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_water_user ON water_log(user_id, logged_at DESC);

-- ---------------- CUSTOM WORKOUTS ----------------
-- exercises is a JSON-encoded array of {exerciseId, sets} objects.
CREATE TABLE IF NOT EXISTS custom_workouts (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  exercises   TEXT NOT NULL,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cw_user ON custom_workouts(user_id, created_at DESC);

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
