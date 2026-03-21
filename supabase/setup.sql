-- ============================================
-- 四柱推命アプリ: データベースセットアップ
-- Supabase SQL Editor で実行してください
-- ============================================

-- 1. profiles（ユーザープロフィール）
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    TEXT,
  birth_date  DATE NOT NULL,
  birth_time  TIME,
  gender      TEXT CHECK (gender IN ('male', 'female', 'other')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. meishiki（命式 — 四柱推命の計算結果キャッシュ）
CREATE TABLE meishiki (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year_stem       TEXT NOT NULL,
  year_branch     TEXT NOT NULL,
  month_stem      TEXT NOT NULL,
  month_branch    TEXT NOT NULL,
  day_stem        TEXT NOT NULL,
  day_branch      TEXT NOT NULL,
  hour_stem       TEXT,
  hour_branch     TEXT,
  year_star       TEXT,
  month_star      TEXT,
  hour_star       TEXT,
  wood_count      INT DEFAULT 0,
  fire_count      INT DEFAULT 0,
  earth_count     INT DEFAULT 0,
  metal_count     INT DEFAULT 0,
  water_count     INT DEFAULT 0,
  personality     TEXT,
  strengths       TEXT,
  weaknesses      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. daily_fortunes（日運）
CREATE TABLE daily_fortunes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fortune_date  DATE NOT NULL,
  overall       INT CHECK (overall BETWEEN 1 AND 5),
  work          INT CHECK (work BETWEEN 1 AND 5),
  love          INT CHECK (love BETWEEN 1 AND 5),
  money         INT CHECK (money BETWEEN 1 AND 5),
  health        INT CHECK (health BETWEEN 1 AND 5),
  advice        TEXT,
  lucky_color   TEXT,
  lucky_dir     TEXT,
  lucky_number  INT,
  day_stem      TEXT NOT NULL,
  day_branch    TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, fortune_date)
);

-- ============================================
-- RLS（行レベルセキュリティ）を有効化
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meishiki ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_fortunes ENABLE ROW LEVEL SECURITY;

-- 自分のデータだけ読み書き可能
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own meishiki"
  ON meishiki FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meishiki"
  ON meishiki FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meishiki"
  ON meishiki FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own fortunes"
  ON daily_fortunes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fortunes"
  ON daily_fortunes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 新規ユーザー登録時に profiles を自動作成する関数
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ※ トリガーは profiles.birth_date が NOT NULL のため
--   ユーザー登録後に生年月日を入力するフローにします
--   そのため自動作成は使わず、アプリ側で INSERT します
