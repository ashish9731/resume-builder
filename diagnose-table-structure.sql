-- Diagnostic script to check actual saved_resumes table structure
-- Run this in your Supabase SQL editor to see what columns exist

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    is_identity
FROM information_schema.columns 
WHERE table_name = 'saved_resumes' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for any NOT NULL constraints
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'saved_resumes';

-- Check RLS policies
SELECT 
    policyname,
    tablename,
    roles,
    qual,
    with_check
FROM pg_policy pol
JOIN pg_class pc ON pc.oid = pol.polrelid
WHERE pc.relname = 'saved_resumes';

-- Test insert to see exact error
-- INSERT INTO saved_resumes (user_id) VALUES ('00000000-0000-0000-0000-000000000000');