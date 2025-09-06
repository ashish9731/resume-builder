"use client"
import { memo } from 'react'

interface PersonalInfoStepProps {
  resumeData: any
  handleInputChange: (section: string, field: string, value: any, index?: number) => void
}

const PersonalInfoStep = memo(({ resumeData, handleInputChange }: PersonalInfoStepProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Full Name *</label>
          <input
            type="text"
            value={resumeData.personalInfo.fullName}
            onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Email *</label>
          <input
            type="email"
            value={resumeData.personalInfo.email}
            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Phone *</label>
          <input
            type="tel"
            value={resumeData.personalInfo.phone}
            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Location *</label>
          <input
            type="text"
            value={resumeData.personalInfo.location}
            onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="New York, NY"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">LinkedIn</label>
          <input
            type="url"
            value={resumeData.personalInfo.linkedin}
            onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Website</label>
          <input
            type="url"
            value={resumeData.personalInfo.website}
            onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://johndoe.com"
          />
        </div>
      </div>
    </div>
  )
})

PersonalInfoStep.displayName = 'PersonalInfoStep'

export default PersonalInfoStep
