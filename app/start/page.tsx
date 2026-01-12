"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { SupabaseClient } from '@supabase/supabase-js'

export default function StartPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Initialize Supabase only in the browser
    setSupabase(getSupabaseBrowser())
  }, [])

  useEffect(() => {
    if (!supabase) return

    let mounted = true

    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        
        if (user && mounted) {
          router.push('/app')
        } else if (mounted) {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (mounted) {
          router.push('/auth')
        }
      } finally {
        if (mounted) {
          setChecked(true)
        }
      }
    }

    checkAuth()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  if (!checked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-stone-800 text-xl">Loading...</div>
      </div>
    )
  }

  // This should never be reached due to redirects, but just in case
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 flex items-center justify-center">
      <div className="text-stone-800 text-xl">Redirecting...</div>
    </div>
  )
}