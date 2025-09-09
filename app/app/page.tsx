"use client"
import Link from 'next/link'
import { ArrowLeft, FileUp, FilePlus2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js'

export default function ApplicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

  useEffect(() => {
    // Initialize Supabase only in the browser
    setSupabase(getSupabaseBrowser())
  }, [])

  useEffect(() => {
    if (!supabase) return
    
    // Check Supabase authentication
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setLoading(false)
      } else {
        router.push('/auth')
      }
    }
    
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth')
      } else if (session?.user) {
        setUser(session.user)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-white/80 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-white">Resume Builder</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/80 text-sm">
                Welcome, {user?.email || 'User'}
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Resume Building Method
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Upload an existing resume for AI-powered analysis and enhancement, or create a new one from scratch with built-in AI assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Upload Resume Card */}
          <Link href="/app/upload" className="group">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/30 transition-colors">
                  <FileUp className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Upload Resume</h3>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Upload your existing resume (PDF, DOCX, or TXT) and get AI-powered analysis and enhancement recommendations.
                </p>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>AI Analysis & Recommendations</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>ATS Optimization</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Professional PDF Export</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Create New Resume Card */}
          <Link href="/app/create" className="group">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500/30 transition-colors">
                  <FilePlus2 className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Create New Resume</h3>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Build a professional resume from scratch with AI assistance for each section and real-time optimization.
                </p>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>AI-Powered Form Assistance</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Real-time ATS Optimization</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Step-by-step Guidance</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Why Choose Our Resume Builder?</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileUp className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h4>
              <p className="text-white/70 text-sm">Get detailed insights and recommendations to improve your resume's impact.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FilePlus2 className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">ATS Optimization</h4>
              <p className="text-white/70 text-sm">Ensure your resume passes through Applicant Tracking Systems.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileUp className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Professional Export</h4>
              <p className="text-white/70 text-sm">Download your resume as a beautifully formatted PDF.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}