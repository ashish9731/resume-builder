-- Essential columns fix for saved_resumes table
-- Run this in your Supabase SQL editor to fix immediate errors

-- Add the critical missing columns that are causing PGRST204 errors
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS original_text TEXT;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS ai_analysis TEXT;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS enhanced_text TEXT;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS template_used TEXT;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS parsed_data JSONB;
ALTER TABLE saved_resumes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update any existing records
UPDATE saved_resumes SET updated_at = NOW() WHERE updated_at IS NULL;

-- Verify the columns were added
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'saved_resumes' AND table_schema = 'public';