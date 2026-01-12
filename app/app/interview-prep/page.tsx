"use client"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import InterviewPrep from '@/components/InterviewPrep'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { useEffect, useState } from 'react'

export default function InterviewPrepPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Initialize Supabase only in the browser
    const client = getSupabaseBrowser()
    setSupabase(client)
  }, [])

  useEffect(() => {
    if (!supabase) return
    
    let mounted = true;
    
    // Check Supabase authentication
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        
        if (user && mounted) {
          setLoading(false)
        } else if (mounted) {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (mounted) {
          router.push('/auth')
        }
      }
    }
    
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
          router.push('/auth')
        }
      } else if (session?.user) {
        if (mounted) {
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false;
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleBackToDashboard = () => {
    router.push('/app')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-stone-800 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
      <div className="container mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/app" className="inline-flex items-center text-stone-600 hover:text-stone-800 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-stone-300 text-stone-700 hover:bg-stone-100"
          >
            Sign out
          </Button>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <InterviewPrep onBack={handleBackToDashboard} />
        </div>
      </div>
    </div>
  )
}