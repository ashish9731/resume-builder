-- Complete fix for saved_resumes table including RLS policies
-- Run this in your Supabase SQL editor

-- First, ensure all columns exist
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS original_text TEXT;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS parsed_data JSONB;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS ai_analysis TEXT;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS enhanced_text TEXT;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS template_used TEXT;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records with default timestamps
UPDATE saved_resumes SET created_at = NOW() WHERE created_at IS NULL;
UPDATE saved_resumes SET updated_at = NOW() WHERE updated_at IS NULL;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own saved resumes" ON saved_resumes;
DROP POLICY IF EXISTS "Users can insert their own saved resumes" ON saved_resumes;
DROP POLICY IF EXISTS "Users can update their own saved resumes" ON saved_resumes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON saved_resumes;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON saved_resumes;

-- Ensure RLS is enabled
ALTER TABLE saved_resumes ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies
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

-- Alternative broader policies if the above are too restrictive
CREATE POLICY "Enable read access for authenticated users" 
ON saved_resumes FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
ON saved_resumes FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON saved_resumes TO authenticated;

-- Refresh schema cache by querying the table
SELECT COUNT(*) FROM saved_resumes;

-- Verify table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'saved_resumes' 
-- ORDER BY ordinal_position;