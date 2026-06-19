-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (to store user profile info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  avatar_id INTEGER,
  college TEXT,
  degree TEXT,
  branch TEXT,
  graduation_year TEXT,
  profile_confirmed BOOLEAN DEFAULT FALSE,
  plan TEXT DEFAULT 'free',
  analyses_used INTEGER DEFAULT 0,
  analyses_reset_date TIMESTAMPTZ,
  cover_letters_used INTEGER DEFAULT 0,
  cover_letters_reset_date TIMESTAMPTZ,
  interviews_used INTEGER DEFAULT 0,
  interviews_reset_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback table (to store user feedback and support requests)
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  page_url TEXT,
  screenshot_url TEXT,
  contact_me BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns if they don't exist
DO $$
BEGIN
  -- Add page_url if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'feedback' AND column_name = 'page_url') THEN
    ALTER TABLE public.feedback ADD COLUMN page_url TEXT;
  END IF;
  
  -- Add screenshot_url if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'feedback' AND column_name = 'screenshot_url') THEN
    ALTER TABLE public.feedback ADD COLUMN screenshot_url TEXT;
  END IF;
  
  -- Add contact_me if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'feedback' AND column_name = 'contact_me') THEN
    ALTER TABLE public.feedback ADD COLUMN contact_me BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Drop old page column if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'feedback' AND column_name = 'page') THEN
    ALTER TABLE public.feedback DROP COLUMN page;
  END IF;
END $$;

-- Add usage tracking columns to profiles table (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'avatar_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_id INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'profile_confirmed'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN profile_confirmed BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add usage tracking columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN plan TEXT DEFAULT 'free';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'analyses_used'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN analyses_used INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'analyses_reset_date'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN analyses_reset_date TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'cover_letters_used'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN cover_letters_used INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'cover_letters_reset_date'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN cover_letters_reset_date TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'interviews_used'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN interviews_used INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'profiles' 
    AND column_name = 'interviews_reset_date'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN interviews_reset_date TIMESTAMPTZ;
  END IF;
END $$;

-- Update existing profiles with default values
UPDATE public.profiles
SET 
  plan = COALESCE(plan, 'free'),
  analyses_used = COALESCE(analyses_used, 0),
  cover_letters_used = COALESCE(cover_letters_used, 0),
  interviews_used = COALESCE(interviews_used, 0);

-- Create storage bucket for feedback screenshots if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-screenshots', 'feedback-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure RLS is enabled on storage.objects (required for policies to work)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload to the feedback-screenshots bucket
CREATE POLICY "Allow authenticated users to upload feedback screenshots"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'feedback-screenshots');

-- Allow public read access to feedback-screenshots bucket objects
CREATE POLICY "Allow public access to feedback screenshots"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'feedback-screenshots');

-- Allow authenticated users to update their own objects in feedback-screenshots bucket
CREATE POLICY "Allow authenticated users to update their feedback screenshots"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'feedback-screenshots' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'feedback-screenshots' AND auth.uid() = owner);

-- Allow authenticated users to delete their own objects in feedback-screenshots bucket
CREATE POLICY "Allow authenticated users to delete their feedback screenshots"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'feedback-screenshots' AND auth.uid() = owner);

-- Analyses table (to store resume analyses)
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT NOT NULL,
  file_name TEXT NOT NULL,
  resume_text TEXT,
  job_description TEXT,
  analysis_result JSONB NOT NULL,
  is_saved BOOLEAN DEFAULT FALSE,
  interview_questions JSONB,
  is_public BOOLEAN DEFAULT FALSE
);

-- Add interview_questions column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'analyses' 
    AND column_name = 'interview_questions'
  ) THEN
    ALTER TABLE public.analyses ADD COLUMN interview_questions JSONB;
  END IF;
END $$;

-- Add is_public column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'analyses' 
    AND column_name = 'is_public'
  ) THEN
    ALTER TABLE public.analyses ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- RLS policies for analyses table
CREATE POLICY "Users can view their own analyses"
  ON public.analyses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public analyses"
  ON public.analyses
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own analyses"
  ON public.analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
  ON public.analyses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
  ON public.analyses
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for feedback table
CREATE POLICY "Users can create their own feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON public.analyses(created_at DESC);

-- Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
