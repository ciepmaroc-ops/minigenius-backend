-- Parent accounts
CREATE TABLE IF NOT EXISTS parent_accounts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id            UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   TEXT NOT NULL UNIQUE,
  display_name            TEXT,
  country_code            CHAR(2),
  locale                  TEXT DEFAULT 'en',
  subscription_status     TEXT DEFAULT 'free'
    CHECK (subscription_status IN ('free', 'trial', 'active', 'cancelled', 'past_due')),
  subscription_expires_at TIMESTAMPTZ,
  coppa_consent_given     BOOLEAN DEFAULT FALSE,
  coppa_consent_at        TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- Child profiles
CREATE TABLE IF NOT EXISTS child_profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id    UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_id    TEXT,
  birth_year   SMALLINT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Activity manifests
CREATE TABLE IF NOT EXISTS activity_manifests (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                       TEXT NOT NULL UNIQUE,
  title_en                   TEXT NOT NULL,
  title_ar                   TEXT,
  title_fr                   TEXT,
  category                   TEXT,
  target_age_min             SMALLINT DEFAULT 5,
  target_age_max             SMALLINT DEFAULT 6,
  sequence_url               TEXT,
  thumbnail_url              TEXT,
  estimated_duration_seconds INT,
  required_plan              TEXT DEFAULT 'free'
    CHECK (required_plan IN ('free', 'premium')),
  is_published               BOOLEAN DEFAULT FALSE,
  version                    TEXT DEFAULT '1.0.0',
  created_at                 TIMESTAMPTZ DEFAULT now(),
  updated_at                 TIMESTAMPTZ DEFAULT now()
);

-- Activity sessions
CREATE TABLE IF NOT EXISTS activity_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  activity_id       UUID NOT NULL REFERENCES activity_manifests(id),
  started_at        TIMESTAMPTZ DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  duration_seconds  INT,
  score             SMALLINT CHECK (score BETWEEN 0 AND 100),
  max_score         SMALLINT,
  attempts          SMALLINT DEFAULT 1,
  completion_status TEXT DEFAULT 'in_progress'
    CHECK (completion_status IN ('in_progress', 'completed', 'abandoned')),
  created_at        TIMESTAMPTZ DEFAULT now()
);