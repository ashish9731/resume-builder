"use client"
import { useState, useRef } from 'react'
import { Mic, Square, Download, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CommunicationCoachProps {
  onBack: () => void
}

export default function CommunicationCoach({ onBack }: CommunicationCoachProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        // In a real implementation, we would send the audio to a speech-to-text service
        // For this demo, we'll simulate transcription
        const simulatedTranscript = "Hello, my name is John Doe and I'm applying for the Software Engineer position. I have five years of experience in full-stack development with React, Node.js, and cloud technologies. In my previous role at TechCorp, I led a team of developers and delivered projects 20% ahead of schedule."
        setTranscript(simulatedTranscript)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setError('')
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to use this feature.')
      console.error('Error accessing microphone:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const analyzeSpeech = async () => {
    if (!transcript) {
      setError('Please record or enter some speech text first.')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const response = await fetch('/api/communication-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze speech')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (err) {
      setError('Failed to analyze speech. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownload = () => {
    if (!analysis) return
    
    const blob = new Blob([analysis], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'communication-analysis.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Communication Coach</h2>
        <Button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center mb-4">
          <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Record Your Speech</h3>
        </div>
        
        <p className="text-white/70 mb-6">
          Read a paragraph from your resume or introduce yourself to analyze your professional tone.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          {!transcript ? (
            <>
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center px-6 py-3 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                }`}
                disabled={isAnalyzing}
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              <p className="text-white/50 text-sm">
                {isRecording 
                  ? 'Recording... Click stop when finished' 
                  : 'Click to start recording your speech'}
              </p>
            </>
          ) : (
            <div className="w-full">
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/90 mb-2">Your Transcript</label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="Your recorded speech will appear here..."
                />
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={analyzeSpeech}
                  disabled={isAnalyzing || !transcript}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-4 h-4" />
                      Analyze Speech
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => {
                    setTranscript('')
                    setAnalysis('')
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Record Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {analysis && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Speech Analysis</h3>
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
      )}
    </div>
  )
}