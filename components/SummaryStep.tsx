"use client"
import { memo } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SummaryStepProps {
  resumeData: any
  handleInputChange: (section: string, field: string, value: any, index?: number) => void
  handleAISummary: () => void
  loading: boolean
}

const SummaryStep = memo(({ resumeData, handleInputChange, handleAISummary, loading }: SummaryStepProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Professional Summary</h2>
        <Button
          onClick={handleAISummary}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              AI Writing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 w-4 h-4" />
              AI Assist
            </>
          )}
        </Button>
      </div>
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Summary *</label>
        <textarea
          value={resumeData.summary}
          onChange={(e) => handleInputChange('summary', '', e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
          placeholder="Experienced software engineer with 5+ years of experience in full-stack development... or click AI Assist"
          required
        />
      </div>
    </div>
  )
})

SummaryStep.displayName = 'SummaryStep'

export default SummaryStep
