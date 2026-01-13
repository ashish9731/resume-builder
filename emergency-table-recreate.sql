-- Emergency fix: Recreate saved_resumes table if needed
-- ONLY RUN THIS IF OTHER FIXES DON'T WORK
-- This will drop and recreate the table with proper structure

-- Backup existing data first (if any)
-- CREATE TABLE saved_resumes_backup AS SELECT * FROM saved_resumes;

-- Drop existing table and policies
DROP POLICY IF EXISTS "Users can view their own saved resumes" ON saved_resumes;
DROP POLICY IF EXISTS "Users can insert their own saved resumes" ON saved_resumes;
DROP POLICY IF EXISTS "Users can update their own saved resumes" ON saved_resumes;

-- Drop the table
-- DROP TABLE IF EXISTS saved_resumes;

-- Recreate with proper structure
CREATE TABLE saved_resumes (
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

-- Enable RLS
ALTER TABLE saved_resumes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved resumes" 
ON saved_resumes FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved resumes" 
ON saved_resumes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved resumes" 
ON saved_resumes FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON saved_resumes TO authenticated;

-- Test the table
INSERT INTO saved_resumes (user_id, original_text) 
VALUES ('00000000-0000-0000-0000-000000000000', 'test') 
RETURNING *;

DELETE FROM saved_resumes WHERE original_text = 'test';

-- SELECT * FROM saved_resumes LIMIT 5;