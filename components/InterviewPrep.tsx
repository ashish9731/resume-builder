"use client"
import { useState, useRef } from 'react'
import { Play, Square, RotateCcw, Download, Sparkles, AlertCircle, Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InterviewPrepProps {
  onBack: () => void
}

export default function InterviewPrep({ onBack }: InterviewPrepProps) {
  const [step, setStep] = useState<'setup' | 'interview' | 'analysis'>('setup')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [questions, setQuestions] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [interviewResponses, setInterviewResponses] = useState<{ question: string; response: string }[]>([])
  const [currentResponse, setCurrentResponse] = useState('')
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateQuestions = async () => {
    if (!jobTitle.trim() || !jobDescription.trim() || !resume.trim()) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/interview-preparation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'generateQuestions',
          jobTitle,
          jobDescription,
          resume,
          questionCount
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data = await response.json()
      setQuestions(data.questions)
      setInterviewResponses(data.questions.map((q: string) => ({ question: q, response: '' })))
      setStep('interview')
      setCurrentQuestionIndex(0)
      setCurrentResponse('')
      setTimeRemaining(60)
      setTimerActive(false)
    } catch (err) {
      setError('Failed to generate interview questions. Please try again.')
      console.error('Question generation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Timer effect
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && timerActive) {
      // Auto-submit when time runs out
      handleResponseSubmit()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timerActive, timeRemaining])

  const startTimer = () => {
    setTimerActive(true)
    setTimeRemaining(60)
  }

  const stopTimer = () => {
    setTimerActive(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  const finishInterview = async (responses: { question: string; response: string }[]) => {
    setIsLoading(true)
    setError('')
    stopTimer()

    try {
      const response = await fetch('/api/interview-preparation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'analyzeInterview',
          interviewHistory: responses
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze interview')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      setStep('analysis')
    } catch (err) {
      setError('Failed to analyze interview. Please try again.')
      console.error('Interview analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResponseSubmit = () => {
    // Create a new array with the updated response
    const updatedResponses = interviewResponses.map((item: { question: string; response: string }, index: number) => 
      index === currentQuestionIndex ? { ...item, response: currentResponse } : item
    );
    
    setInterviewResponses(updatedResponses)
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentResponse('')
    } else {
      // End of interview
      finishInterview(updatedResponses)
    }
  }

  const handleDownload = () => {
    if (!analysis) return
    
    const blob = new Blob([analysis], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'interview-analysis.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is supported
    const supportedTypes = ['text/', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const isSupported = supportedTypes.some(type => file.type.includes(type)) || 
                       file.name.endsWith('.pdf') || 
                       file.name.endsWith('.docx') || 
                       file.name.endsWith('.txt')
    
    if (!isSupported) {
      setError('Please upload a supported file (TXT, PDF, DOCX)')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Create FormData and append the file
      const formData = new FormData()
      formData.append('file', file)

      // Send file to parse API
      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to process file')
      }

      const data = await response.json()
      if (!data.text) {
        throw new Error('No text content extracted from file')
      }
      
      setResume(data.text)
    } catch (err) {
      setError('Failed to process file. Please try again.')
      console.error('File processing error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const resetInterview = () => {
    setStep('setup')
    setJobTitle('')
    setJobDescription('')
    setResume('')
    setQuestionCount(5)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setInterviewResponses([])
    setCurrentResponse('')
    setAnalysis('')
    setError('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">Interview Prep</h2>
        <Button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-stone-800"
        >
          Back to Dashboard
        </Button>
      </div>

      {step === 'setup' && (
        <div className="bg-white backdrop-blur-xl rounded-2xl p-6 border border-stone-200">
          <div className="flex items-center mb-4">
            <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-stone-800">Interview Setup</h3>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-200">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Job Title *</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Software Engineer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Job Description *</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="Paste the job description here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Your Resume *</label>
              <div className="mb-2">
                <Button
                  onClick={triggerFileUpload}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-stone-800 rounded-lg"
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume File
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.docx"
                  className="hidden"
                />
              </div>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="Paste your resume content here or upload a file above..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Number of Questions (Max 10)
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num} className="bg-gray-800">
                    {num} {num === 1 ? 'Question' : 'Questions'}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={generateQuestions}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Questions...
                </>
              ) : (
                <>
                  <Play className="mr-2 w-4 h-4" />
                  Start Interview
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'interview' && (
        <div className="bg-white backdrop-blur-xl rounded-2xl p-6 border border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
              <h3 className="text-lg font-semibold text-stone-800">Interview Session</h3>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                timeRemaining > 30 ? 'bg-green-100 text-green-800' : 
                timeRemaining > 10 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                ⏱️ {timeRemaining}s
              </div>
              <div className="text-stone-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-200">{error}</span>
            </div>
          )}

          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <p className="text-stone-800 text-lg">
              {questions[currentQuestionIndex]}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-stone-700">
                Your Response
              </label>
              {!timerActive && (
                <Button
                  onClick={startTimer}
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-sm px-3 py-1"
                >
                  Start Timer (60s)
                </Button>
              )}
            </div>
            <textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              placeholder="Type or paste your response here..."
            />
          </div>

          <div className="flex justify-between">
            <Button
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1)
                  // Use optional chaining to prevent TypeScript error
                  setCurrentResponse(interviewResponses[currentQuestionIndex - 1]?.response || '')
                }
              }}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-600 hover:bg-gray-700 text-stone-800"
            >
              Previous
            </Button>
            
            <Button
              onClick={handleResponseSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analysing Answers...
                </>
              ) : currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
            </Button>
          </div>
        </div>
      )}

      {step === 'analysis' && (
        <div className="space-y-6">
          <div className="bg-white backdrop-blur-xl rounded-2xl p-6 border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                <h3 className="text-lg font-semibold text-stone-800">Interview Analysis</h3>
              </div>
              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Analysis
              </Button>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="text-stone-700 whitespace-pre-wrap text-sm leading-relaxed">
                {analysis}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <p className="text-yellow-200 text-xs">
                ⚠️ <strong>Important:</strong> This analysis will be lost when you close the application. Please download and save it to your files.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button
              onClick={resetInterview}
              className="bg-gray-600 hover:bg-gray-700 text-stone-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start New Interview
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}