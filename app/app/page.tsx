"use client"
import Link from 'next/link'
import { ArrowLeft, FileUp, FilePlus2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApplicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check simple authentication
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user')
        if (!user) {
          router.push('/auth')
        } else {
          setLoading(false)
        }
      }
    }
    
    checkAuth()
  }, [router])

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
          >
            Sign out
          </Button>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to Your Resume Builder
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose how you'd like to get started. Upload an existing resume or create a new one from scratch.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <Link href="/app/upload" className="group">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-lg group-hover:shadow-blue-500/50 transition-all">
                  <FileUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Upload Resume</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Upload your existing resume in PDF, DOCX, or TXT format. Our AI will analyze it and provide enhancement suggestions.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>✓ AI-powered analysis</div>
                  <div>✓ ATS optimization</div>
                  <div>✓ Enhancement recommendations</div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/app/create" className="group">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg group-hover:shadow-purple-500/50 transition-all">
                  <FilePlus2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Create New Resume</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Start from scratch with our guided resume builder. Get AI assistance for every section to create the perfect resume.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>✓ Step-by-step guidance</div>
                  <div>✓ AI writing assistance</div>
                  <div>✓ Professional templates</div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">What You'll Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
              <p className="text-gray-400 text-sm">Get instant feedback and improvement suggestions</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-2">📄</div>
              <h3 className="text-lg font-semibold text-white mb-2">PDF Export</h3>
              <p className="text-gray-400 text-sm">Download your resume in professional PDF format</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">ATS Optimized</h3>
              <p className="text-gray-400 text-sm">Ensure your resume passes through screening systems</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}