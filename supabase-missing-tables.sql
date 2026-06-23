-- ============================================================================
-- SUPABASE MISSING TABLES FIX
-- ============================================================================
-- This file creates the premium_interest and survey_rewards tables
-- that are required for the waitlist and survey features.
--
-- Run this SQL in your Supabase SQL Editor to fix the PGRST205 errors:
-- "Could not find the table 'public.premium_interest'"
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: premium_interest
-- ============================================================================
-- Purpose: Tracks users who joined the Premium waitlist
-- Used by: src/routes/coming-soon.tsx, src/components/UpgradeModal.tsx
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.premium_interest (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source TEXT,  -- Tracks where the user joined from (coming_soon_page, upgrade_modal)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)  -- One entry per user
);

-- Add source column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'premium_interest' 
    AND column_name = 'source'
  ) THEN
    ALTER TABLE public.premium_interest ADD COLUMN source TEXT;
  END IF;
END $$;

-- ============================================================================
-- TABLE: survey_rewards
-- ============================================================================
-- Purpose: Tracks survey submissions and bonus analyses rewards
-- Used by: src/components/SurveyModal.tsx
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.survey_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL,  -- Stores survey answers as JSON
  reward_claimed BOOLEAN DEFAULT TRUE NOT NULL,  -- Always TRUE on insert
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)  -- One survey per user
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.premium_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for premium_interest
DROP POLICY IF EXISTS "Users can view their own interest" ON public.premium_interest;
CREATE POLICY "Users can view their own interest"
  ON public.premium_interest
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add their own interest" ON public.premium_interest;
CREATE POLICY "Users can add their own interest"
  ON public.premium_interest
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for survey_rewards
DROP POLICY IF EXISTS "Users can view their own survey" ON public.survey_rewards;
CREATE POLICY "Users can view their own survey"
  ON public.survey_rewards
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can submit their own survey" ON public.survey_rewards;
CREATE POLICY "Users can submit their own survey"
  ON public.survey_rewards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS premium_interest_user_id_idx ON public.premium_interest(user_id);
CREATE INDEX IF NOT EXISTS premium_interest_created_at_idx ON public.premium_interest(created_at);
CREATE INDEX IF NOT EXISTS survey_rewards_user_id_idx ON public.survey_rewards(user_id);
CREATE INDEX IF NOT EXISTS survey_rewards_created_at_idx ON public.survey_rewards(created_at);

-- ============================================================================
-- TABLE COMMENTS (DOCUMENTATION)
-- ============================================================================

COMMENT ON TABLE public.premium_interest IS 'Tracks users interested in Premium launch notification';
COMMENT ON COLUMN public.premium_interest.user_id IS 'Reference to auth.users.id';
COMMENT ON COLUMN public.premium_interest.source IS 'Tracks where the user joined from (coming_soon_page, upgrade_modal)';
COMMENT ON COLUMN public.premium_interest.created_at IS 'Timestamp when user joined waitlist';

COMMENT ON TABLE public.survey_rewards IS 'Tracks survey completion and rewards (one-time per user)';
COMMENT ON COLUMN public.survey_rewards.user_id IS 'Reference to auth.users.id';
COMMENT ON COLUMN public.survey_rewards.answers IS 'JSON object containing survey answers';
COMMENT ON COLUMN public.survey_rewards.reward_claimed IS 'Whether +2 bonus analyses were granted';
COMMENT ON COLUMN public.survey_rewards.created_at IS 'Timestamp when survey was submitted';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the tables were created successfully:
--
-- SELECT * FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('premium_interest', 'survey_rewards');
--
-- SELECT * FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'premium_interest';
--
-- SELECT * FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'survey_rewards';
-- ============================================================================
