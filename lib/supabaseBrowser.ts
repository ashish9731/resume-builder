import { createBrowserClient } from '@supabase/ssr'

export const getSupabaseBrowser = () => {
  // Get environment variables with fallbacks for build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  // Create and return the Supabase client
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}

export default getSupabaseBrowser