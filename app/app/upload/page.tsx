"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, Download, Sparkles, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { SupabaseClient } from '@supabase/supabase-js'
import { parseResume } from '@/lib/resumeParser'
import { generateResumePDF } from '@/lib/pdfGenerator'
import { formatResumeForDisplay } from '@/lib/resumeFormatter'
import { saveResumeToSupabase } from '@/lib/resumeStorage'
import ResumePreviewModal from '@/components/ResumePreviewModal'
import DownloadNotification from '@/components/DownloadNotification'

export default function UploadPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [enhancedResume, setEnhancedResume] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('professional')
  const [parsedResume, setParsedResume] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1) // 1: Upload, 2: Analyze, 3: Enhance, 4: Download
  const [showOriginal, setShowOriginal] = useState(true)
  const [showEnhanced, setShowEnhanced] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  // Initialize Supabase
  useEffect(() => {
    const client = getSupabaseBrowser()
    setSupabase(client)
  }, [])

  // Check authentication
  useEffect(() => {
    if (!supabase) return
    
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        
        if (!user && mounted) {
          router.push('/auth')
        } else if (mounted) {
          setAuthChecked(true)
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
      }
    })
    
    return () => {
      mounted = false;
      subscription.unsubscribe()
    }
  }, [router, supabase])

  // Prevent browser from opening file when dropped outside the drop zone
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener('dragover', preventDefault, { passive: false })
    window.addEventListener('drop', preventDefault, { passive: false })
    return () => {
      window.removeEventListener('dragover', preventDefault)
      window.removeEventListener('drop', preventDefault)
    }
  }, [])

  const processSelectedFile = async (selectedFile: File) => {
    setFile(selectedFile)
    setUploading(true)

    try {
      // Step 1: Extract text from file
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to parse file')
      }

      const data = await response.json()
      setResumeText(data.text)
      
      // Step 2: Parse into structured sections
      const parsedData = parseResume(data.text)
      setParsedResume(parsedData)
      
      setCurrentStep(2)
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    await processSelectedFile(selectedFile)
  }

  const handleAnalyze = async () => {
    if (!resumeText) return

    // Check if job description is provided
    if (!jobDescription.trim()) {
      alert('Please provide a job description to tailor your resume.')
      return
    }

    setAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: resumeText,
          jobDescription: jobDescription.trim()
        }),
      })

      let data: any = null
      try {
        data = await response.json()
      } catch (e) {
        const text = await response.text()
        if (!response.ok) {
          throw new Error(text || 'Failed to analyze resume')
        }
        throw new Error('Unexpected response from server')
      }
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to analyze resume')
      }
      
      setAnalysis(data.analysis)
      
      // Save to Supabase
      if (supabase && parsedResume) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await saveResumeToSupabase({
            originalText: resumeText,
            parsedData: parsedResume,
            aiAnalysis: data.analysis,
            templateUsed: selectedTemplate
          }, user.id);
        }
      }
      
      setCurrentStep(3)
    } catch (error) {
      console.error('Analysis error:', error)
      const message = (error as any)?.message || 'Failed to analyze resume. Please try again.'
      alert(message)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleEnhance = async () => {
    if (!resumeText || !analysis) return

    setEnhancing(true)
    try {
      // Use parsed structured data if available, otherwise fall back to raw text
      const textToSend = parsedResume ? 
        formatResumeForDisplay(parsedResume) : 
        resumeText;
      
      console.log('Sending enhancement request...');
      console.log('Text to send length:', textToSend?.length);
      console.log('Job description length:', jobDescription?.trim()?.length);
      
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textToSend,
          analysis: analysis,
          jobDescription: jobDescription.trim()
        }),
      })

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error ${response.status}: ${errorText || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log('API Response data keys:', Object.keys(data));
      console.log('Enhanced content length:', data.enhanced?.length);
      setEnhancedResume(data.enhanced)
      
      // Log that storage is disabled and notify user
      console.log('Cloud storage disabled - Please download your resume manually');
      
      setCurrentStep(4)
    } catch (error: any) {
      console.error('Enhancement error:', error)
      console.error('Error type:', error?.constructor?.name)
      console.error('Error message:', error?.message)
      console.error('Full error object:', error);
      
      // Display the actual error message
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Enhancement failed: ${errorMessage}`);
    } finally {
      setEnhancing(false)
    }
  }

  const handleDownload = async () => {
    if (!enhancedResume) return

    try {
      // Option 1: Use new structured PDF generator
      if (parsedResume) {
        const enhancedParsed = parseResume(enhancedResume);
        const pdfBytes = await generateResumePDF(enhancedParsed, selectedTemplate);
        
        // Convert to proper ArrayBuffer for Blob
        const uint8Array = new Uint8Array(pdfBytes);
        const blob = new Blob([uint8Array], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enhanced-resume-${selectedTemplate}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Option 2: Fall back to existing PDF API
        const response = await fetch('/api/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: enhancedResume,
            template: selectedTemplate
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`PDF generation failed: ${errorText}`);
        }

        const pdfBlob = await response.blob();
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enhanced-resume-${selectedTemplate}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Download failed: ${errorMessage}`);
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
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
            className="border-white/20 text-white hover:bg-white/10/10 backdrop-blur-sm"
          >
            Sign out
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                    : 'bg-white/10 text-white/50'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-16">
            <span className={`text-sm ${currentStep >= 1 ? 'text-white' : 'text-white/50'}`}>Upload</span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-white' : 'text-white/50'}`}>Analyze</span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-white' : 'text-white/50'}`}>Enhance</span>
            <span className={`text-sm ${currentStep >= 4 ? 'text-white' : 'text-white/50'}`}>Download</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Actions */}
          <div className="space-y-6">
            {/* Step 1: Upload */}
            {currentStep === 1 && (
              <div className="bg-white/10/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Upload className="mr-3 w-6 h-6" />
                  Upload Your Resume
                </h2>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging ? 'border-cyan-400 bg-white/10/5' : 'border-white/30'
                  }`}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsDragging(true)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsDragging(false)
                  }}
                  onDrop={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsDragging(false)
                    let droppedFile: File | null = null
                    const dt = e.dataTransfer
                    if (dt?.items && dt.items.length > 0) {
                      for (let i = 0; i < dt.items.length; i++) {
                        const item = dt.items[i]
                        if (item && item.kind === 'file') {
                          const f = item.getAsFile()
                          if (f) { droppedFile = f; break }
                        }
                      }
                    } else if (dt?.files && dt.files.length > 0) {
                      droppedFile = dt.files.item(0) || null
                    }
                    if (droppedFile) await processSelectedFile(droppedFile)
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-white/50 mb-4" />
                    <p className="text-white mb-2">Click to upload or drag and drop</p>
                    <p className="text-white/50 text-sm">PDF, DOCX, or TXT files only</p>
                  </label>
                </div>
                {uploading && (
                  <div className="mt-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-white">Processing file...</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Analysis */}
            {currentStep === 2 && (
              <div className="bg-white/10/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Sparkles className="mr-3 w-6 h-6" />
                  AI Analysis Complete
                </h2>
                <p className="text-white/80 mb-4">Your resume has been analyzed. Review the suggestions below.</p>
                
                {/* Job Description Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Target Job Description *
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                    placeholder="Paste the job description here to tailor your resume for this specific role..."
                    required
                  />
                  <p className="text-white/50 text-xs mt-2">
                    Required: Adding a job description helps us optimize your resume specifically for that role.
                  </p>
                </div>
                
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-4 h-4" />
                      Analyze Resume
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: Enhancement */}
            {currentStep === 3 && (
              <div className="bg-white/10/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <CheckCircle className="mr-3 w-6 h-6" />
                  Ready to Enhance
                </h2>
                <p className="text-white/80 mb-4">Based on the analysis, we can enhance your resume with AI.</p>
                <Button
                  onClick={handleEnhance}
                  disabled={enhancing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {enhancing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-4 h-4" />
                      Enhance Resume Now
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 4: Download */}
            {currentStep === 4 && (
              <div className="bg-white/10/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Download className="mr-3 w-6 h-6" />
                  Download Your Resume
                </h2>
                <p className="text-white/80 mb-4">Your enhanced resume is ready for download!</p>
                
                {/* Standardized Resume Format - No Templates */}
                <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <h3 className="text-white font-semibold mb-2">📄 Universal Resume Format</h3>
                  <p className="text-white/80 text-sm">
                    Your AI-enhanced resume will be generated in our standardized professional format with proper section hierarchy and ATS optimization.
                  </p>
                </div>
                
                <Button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Download className="mr-2 w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <div className="bg-white/10/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <AlertCircle className="mr-2 w-5 h-5 text-yellow-400" />
                  Comprehensive AI Analysis
                </h3>
                <div className="bg-white/10/5 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed">
                    {analysis}
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <p className="text-blue-200 text-xs">
                    💡 <strong>Expert Analysis:</strong> This comprehensive review covers structure, content quality, ATS optimization, and competitive positioning to help your resume stand out.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Resume Content */}
          <div className="space-y-6">
            {/* Original Resume */}
            {resumeText && (
              <div className="bg-white/10/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FileText className="mr-2 w-5 h-5" />
                    Original Resume
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="text-white/80 hover:text-white"
                  >
                    {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {showOriginal && (
                  <div className="bg-white/10/5 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-white/80 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                      {resumeText}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Resume */}
            {enhancedResume && (
              <div className="bg-white/10/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Sparkles className="mr-2 w-5 h-5 text-purple-400" />
                    AI-Enhanced Resume
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEnhanced(!showEnhanced)}
                    className="text-white/80 hover:text-white"
                  >
                    {showEnhanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {showEnhanced && (
                  <div className="bg-white/10/5 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                      {enhancedResume}
                    </div>
                  </div>
                )}
                <div className="mt-4 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <p className="text-purple-200 text-xs">
                    ✨ <strong>AI Enhancement:</strong> Your resume has been professionally enhanced with powerful action verbs, quantified achievements, and ATS-optimized content while maintaining complete accuracy.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}