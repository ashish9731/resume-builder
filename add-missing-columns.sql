-- Add missing columns to saved_resumes table
-- Run this in your Supabase SQL editor

-- Add ai_analysis column if it doesn't exist
ALTER TABLE saved_resumes 
ADD COLUMN IF NOT EXISTS ai_analysis TEXT;

-- Add original_text column if it doesn't exist
ALTER TABLE saved_resumes 
ADD COLUMN IF NOT EXISTS original_text TEXT;

-- Add parsed_data column if it doesn't exist (JSONB for structured data)
ALTER TABLE saved_resumes 
ADD COLUMN IF NOT EXISTS parsed_data JSONB;

-- Add enhanced_text column if it doesn't exist
ALTER TABLE saved_resumes 
ADD COLUMN IF NOT EXISTS enhanced_text TEXT;

-- Add template_used column if it doesn't exist
ALTER TABLE saved_resumes 
ADD COLUMN IF NOT EXISTS template_used TEXT;

-- Add updated_at column if it doesn't exist
ALTER TABLE saved_resumes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have default values where needed
UPDATE saved_resumes 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Refresh the schema cache
-- Note: This happens automatically, but you may need to redeploy your app

-- Optional: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_resumes_ai_analysis ON saved_resumes(ai_analysis);
CREATE INDEX IF NOT EXISTS idx_saved_resumes_enhanced_text ON saved_resumes(enhanced_text);
CREATE INDEX IF NOT EXISTS idx_saved_resumes_template_used ON saved_resumes(template_used);