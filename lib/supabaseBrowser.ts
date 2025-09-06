import { createBrowserClient } from '@supabase/ssr'

export const getSupabaseBrowser = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default getSupabaseBrowser