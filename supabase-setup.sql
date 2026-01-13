-- Supabase Table Creation Script
-- Run this in your Supabase SQL editor

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_text TEXT,
  parsed_data JSONB,
  ai_analysis TEXT,
  enhanced_text TEXT,
  template_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_analyses table
CREATE TABLE IF NOT EXISTS interview_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT,
  job_description TEXT,
  resume_text TEXT,
  questions JSONB,
  responses JSONB,
  analysis TEXT,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communication_analyses table
CREATE TABLE IF NOT EXISTS communication_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript TEXT,
  analysis TEXT,
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_analyses_user_id ON interview_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_analyses_user_id ON communication_analyses(user_id);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for resumes table
CREATE POLICY "Users can view their own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for interview_analyses table
CREATE POLICY "Users can view their own interview analyses" ON interview_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview analyses" ON interview_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for communication_analyses table
CREATE POLICY "Users can view their own communication analyses" ON communication_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own communication analyses" ON communication_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);