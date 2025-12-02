"use client"
import { useState } from 'react'
import { Play, Square, RotateCcw, Download, Sparkles, AlertCircle } from 'lucide-react'
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

  const handleSetupSubmit = async () => {
    if (!jobTitle || !jobDescription || !resume) {
      setError('Please fill in all required fields.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/interview-prep', {
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
    } catch (err) {
      setError('Failed to generate interview questions. Please try again.')
      console.error('Question generation error:', err)
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

  const finishInterview = async (responses: { question: string; response: string }[]) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/interview-prep', {
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
        <h2 className="text-2xl font-bold text-white">Interview Prep</h2>
        <Button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          Back to Dashboard
        </Button>
      </div>

      {step === 'setup' && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center mb-4">
            <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Interview Setup</h3>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-200">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Job Title *</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Software Engineer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Job Description *</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="Paste the job description here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Your Resume *</label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="Paste your resume content here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Number of Questions (Max 10)
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num} className="bg-gray-800">
                    {num} {num === 1 ? 'Question' : 'Questions'}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleSetupSubmit}
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
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Interview Session</h3>
            </div>
            <div className="text-white/70">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-200">{error}</span>
            </div>
          )}

          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <p className="text-white text-lg">
              {questions[currentQuestionIndex]}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white/90 mb-2">
              Your Response
            </label>
            <textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
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
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Previous
            </Button>
            
            <Button
              onClick={handleResponseSubmit}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
            </Button>
          </div>
        </div>
      )}

      {step === 'analysis' && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Interview Analysis</h3>
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
              <div className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed">
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
              className="bg-gray-600 hover:bg-gray-700 text-white"
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