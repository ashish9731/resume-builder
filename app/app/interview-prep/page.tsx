"use client"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import InterviewPrep from '@/components/InterviewPrep'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'

export default function InterviewPrepPage() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleBackToDashboard = () => {
    router.push('/app')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/app" className="inline-flex items-center text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
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