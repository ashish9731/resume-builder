-- Fix for title column constraint violation in saved_resumes table
-- Run this in your Supabase SQL editor

-- First, check what columns exist and their constraints
SELECT column_name, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'saved_resumes' 
ORDER BY ordinal_position;

-- Add missing required columns based on the error
-- The error shows 'title' column cannot be null
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '';

-- Also ensure other common required columns exist
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Modify the title column to allow NULL or provide default
ALTER TABLE saved_resumes ALTER COLUMN title DROP NOT NULL;
-- OR if you want to keep NOT NULL constraint:
-- ALTER TABLE saved_resumes ALTER COLUMN title SET DEFAULT 'Untitled Resume';

-- Update any existing rows that might have NULL title
UPDATE saved_resumes SET title = 'Untitled Resume' WHERE title IS NULL;

-- Ensure RLS policies exist
DROP POLICY IF EXISTS "Users can insert saved resumes" ON saved_resumes;
CREATE POLICY "Users can insert saved resumes" 
ON saved_resumes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view saved resumes" ON saved_resumes;
CREATE POLICY "Users can view saved resumes" 
ON saved_resumes FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Test the fix
INSERT INTO saved_resumes (user_id, title, original_text) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Test Resume', 'Sample content')
RETURNING *;

DELETE FROM saved_resumes WHERE title = 'Test Resume';

-- Verify the table is working
SELECT COUNT(*) as total_records FROM saved_resumes;