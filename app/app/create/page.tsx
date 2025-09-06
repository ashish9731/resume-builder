"use client"
import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Briefcase, GraduationCap, Award, Download, Sparkles, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PersonalInfoStep from '@/components/PersonalInfoStep'
import SummaryStep from '@/components/SummaryStep'
// Removed Supabase import

const CreatePage = () => {
  const router = useRouter()
  // Removed Supabase
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [enhancedResume, setEnhancedResume] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [
      { company: '', position: '', duration: '', description: '' }
    ],
    education: [
      { institution: '', degree: '', year: '', gpa: '' }
    ],
    skills: '',
    projects: [
      { name: '', description: '', technologies: '' }
    ],
    certifications: [
      { name: '', issuer: '', date: '' }
    ]
  })

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Summary', icon: Sparkles },
    { number: 3, title: 'Experience', icon: Briefcase },
    { number: 4, title: 'Education', icon: GraduationCap },
    { number: 5, title: 'Skills & More', icon: Award },
    { number: 6, title: 'Preview & Download', icon: Download }
  ]

  const handleInputChange = useCallback((section: string, field: string, value: any, index?: number) => {
    setResumeData(prev => {
      const newData = { ...prev }
      if (index !== undefined) {
        const sectionData = newData[section as keyof typeof prev] as any[]
        sectionData[index] = { ...sectionData[index], [field]: value }
      } else {
        // Handle string fields like summary and skills
        if (section === 'summary' || section === 'skills') {
          (newData as any)[section] = value
        } else {
          (newData as any)[section][field] = value
        }
      }
      return newData
    })
  }, [])

  const addItem = useCallback((section: string) => {
    setResumeData(prev => {
      const newData = { ...prev }
      const emptyItem = section === 'experience' ? { company: '', position: '', duration: '', description: '' } :
                       section === 'education' ? { institution: '', degree: '', year: '', gpa: '' } :
                       section === 'projects' ? { name: '', description: '', technologies: '' } :
                       { name: '', issuer: '', date: '' }
      const sectionData = newData[section as keyof typeof prev] as any[]
      (newData as any)[section] = [...sectionData, emptyItem]
      return newData
    })
  }, [])

  const removeItem = useCallback((section: string, index: number) => {
    setResumeData(prev => {
      const newData = { ...prev }
      const sectionData = newData[section as keyof typeof prev] as any[]
      (newData as any)[section] = sectionData.filter((_: any, i: number) => i !== index)
      return newData
    })
  }, [])

  const generateResume = useMemo(() => {
    let resumeText = `RESUME\n\n`
    
    // Personal Info
    resumeText += `${resumeData.personalInfo.fullName}\n`
    resumeText += `${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone}\n`
    resumeText += `${resumeData.personalInfo.location}\n`
    if (resumeData.personalInfo.linkedin) resumeText += `LinkedIn: ${resumeData.personalInfo.linkedin}\n`
    if (resumeData.personalInfo.website) resumeText += `Website: ${resumeData.personalInfo.website}\n`
    resumeText += `\n`

    // Summary
    if (resumeData.summary) {
      resumeText += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`
    }

    // Experience
    if (resumeData.experience.some(exp => exp.company)) {
      resumeText += `PROFESSIONAL EXPERIENCE\n`
      resumeData.experience.forEach(exp => {
        if (exp.company) {
          resumeText += `${exp.position} at ${exp.company}\n`
          if (exp.duration) resumeText += `${exp.duration}\n`
          if (exp.description) resumeText += `${exp.description}\n\n`
        }
      })
    }

    // Education
    if (resumeData.education.some(edu => edu.institution)) {
      resumeText += `EDUCATION\n`
      resumeData.education.forEach(edu => {
        if (edu.institution) {
          resumeText += `${edu.degree} - ${edu.institution}\n`
          if (edu.year) resumeText += `${edu.year}\n`
          if (edu.gpa) resumeText += `GPA: ${edu.gpa}\n\n`
        }
      })
    }

    // Skills
    if (resumeData.skills) {
      resumeText += `SKILLS\n${resumeData.skills}\n\n`
    }

    // Projects
    if (resumeData.projects.some(proj => proj.name)) {
      resumeText += `PROJECTS\n`
      resumeData.projects.forEach(proj => {
        if (proj.name) {
          resumeText += `${proj.name}\n`
          if (proj.description) resumeText += `${proj.description}\n`
          if (proj.technologies) resumeText += `Technologies: ${proj.technologies}\n\n`
        }
      })
    }

    // Certifications
    if (resumeData.certifications.some(cert => cert.name)) {
      resumeText += `CERTIFICATIONS\n`
      resumeData.certifications.forEach(cert => {
        if (cert.name) {
          resumeText += `${cert.name} - ${cert.issuer}\n`
          if (cert.date) resumeText += `${cert.date}\n\n`
        }
      })
    }

    return resumeText
  }, [resumeData])

  const handleAIAssist = useCallback(async (section: string, context?: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          section, 
          context: context || generateResume,
          resumeData 
        }),
      })

      if (!response.ok) throw new Error('Failed to get AI assistance')

      const data = await response.json()
      return data.suggestion
    } catch (error) {
      console.error('AI assist error:', error)
      alert('Failed to get AI assistance. Please try again.')
      return ''
    } finally {
      setLoading(false)
    }
  }, [generateResume, resumeData])

  const handleAISummary = useCallback(async () => {
    const suggestion = await handleAIAssist('summary', resumeData.personalInfo.fullName + ' ' + resumeData.experience[0]?.position)
    if (suggestion) {
      setResumeData(prev => ({ ...prev, summary: suggestion }))
    }
  }, [handleAIAssist, resumeData.personalInfo.fullName, resumeData.experience])

  const handleAIExperience = useCallback(async (index: number) => {
    const exp = resumeData.experience[index]
    if (!exp) return
    const suggestion = await handleAIAssist('experience', `${exp.position} at ${exp.company}`)
    if (suggestion) {
      setResumeData(prev => ({
        ...prev,
        experience: prev.experience.map((item, i) => 
          i === index ? { ...item, description: suggestion } : item
        )
      }))
    }
  }, [handleAIAssist, resumeData.experience])

  const handleAISkills = useCallback(async () => {
    const suggestion = await handleAIAssist('skills', resumeData.experience[0]?.position)
    if (suggestion) {
      setResumeData(prev => ({ ...prev, skills: suggestion }))
    }
  }, [handleAIAssist, resumeData.experience])

  const handleAIProject = useCallback(async (index: number) => {
    const project = resumeData.projects[index]
    if (!project) return
    const suggestion = await handleAIAssist('project', project.name)
    if (suggestion) {
      setResumeData(prev => ({
        ...prev,
        projects: prev.projects.map((item, i) => 
          i === index ? { ...item, description: suggestion } : item
        )
      }))
    }
  }, [handleAIAssist, resumeData.projects])

  const handleDownload = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generateResume }),
      })

      if (!response.ok) throw new Error('Failed to generate PDF')

      const pdfBlob = await response.blob()
      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'professional-resume.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [generateResume])

  const handleSignOut = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      router.push('/')
    }
  }, [router])

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleNextStep = useCallback(() => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep])

  const handlePreviewResume = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generateResume }),
      })

      if (!response.ok) throw new Error('Failed to enhance resume')

      const data = await response.json()
      setEnhancedResume(data.enhanced)
      setShowPreview(true)
      setCurrentStep(6) // Go to preview step
    } catch (error) {
      console.error('Preview error:', error)
      alert('Failed to generate preview. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [generateResume])

  const handleDownloadPreview = useCallback(async () => {
    if (!enhancedResume) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: enhancedResume }),
      })

      if (!response.ok) throw new Error('Failed to generate PDF')

      const pdfBlob = await response.blob()
      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'enhanced-resume.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [enhancedResume])

  const renderStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep resumeData={resumeData} handleInputChange={handleInputChange} />

      case 2:
        return <SummaryStep resumeData={resumeData} handleInputChange={handleInputChange} handleAISummary={handleAISummary} loading={loading} />

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Work Experience</h2>
              <Button
                onClick={() => addItem('experience')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Experience
              </Button>
            </div>
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Experience {index + 1}</h3>
                  {resumeData.experience.length > 1 && (
                    <Button
                      onClick={() => removeItem('experience', index)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Company *</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Google"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Position *</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleInputChange('experience', 'position', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Software Engineer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Duration</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => handleInputChange('experience', 'duration', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jan 2020 - Present"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-white/90">Description</label>
                      <Button
                        onClick={() => handleAIExperience(index)}
                        disabled={loading}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleInputChange('experience', 'description', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                      placeholder="Developed and maintained web applications... or click AI button"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Education</h2>
              <Button
                onClick={() => addItem('education')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Education
              </Button>
            </div>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Education {index + 1}</h3>
                  {resumeData.education.length > 1 && (
                    <Button
                      onClick={() => removeItem('education', index)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Institution *</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Stanford University"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Degree *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bachelor of Science in Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Year</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleInputChange('education', 'year', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">GPA</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => handleInputChange('education', 'gpa', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3.8/4.0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Skills & Additional Information</h2>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/90">Skills *</label>
                <Button
                  onClick={handleAISkills}
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
              <textarea
                value={resumeData.skills}
                onChange={(e) => handleInputChange('skills', '', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="JavaScript, React, Node.js, Python, SQL, AWS... or click AI Assist"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Projects</h3>
              <Button
                onClick={() => addItem('projects')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Project
              </Button>
            </div>
            {resumeData.projects.map((proj, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Project {index + 1}</h4>
                  {resumeData.projects.length > 1 && (
                    <Button
                      onClick={() => removeItem('projects', index)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Project Name</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => handleInputChange('projects', 'name', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="E-commerce Website"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-white/90">Description</label>
                      <Button
                        onClick={() => handleAIProject(index)}
                        disabled={loading}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <textarea
                      value={proj.description}
                      onChange={(e) => handleInputChange('projects', 'description', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                      placeholder="Built a full-stack e-commerce platform... or click AI button"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Technologies</label>
                    <input
                      type="text"
                      value={proj.technologies}
                      onChange={(e) => handleInputChange('projects', 'technologies', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Certifications</h3>
              <Button
                onClick={() => addItem('certifications')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Certification
              </Button>
            </div>
            {resumeData.certifications.map((cert, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Certification {index + 1}</h4>
                  {resumeData.certifications.length > 1 && (
                    <Button
                      onClick={() => removeItem('certifications', index)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleInputChange('certifications', 'name', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="AWS Certified Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleInputChange('certifications', 'issuer', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Amazon Web Services"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Date</label>
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) => handleInputChange('certifications', 'date', e.target.value, index)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2023"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Enhanced Resume Preview</h2>
              <Button
                onClick={() => setCurrentStep(5)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Back to Edit
              </Button>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="bg-white rounded-lg p-6 text-gray-800 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {enhancedResume}
                </pre>
              </div>
            </div>

          </div>
        )

      default:
        return null
    }
  }, [currentStep, resumeData, handleInputChange, handleAISummary, loading, enhancedResume, showPreview])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto max-w-4xl p-6">
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

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Create New Resume
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Build your professional resume step by step with our guided form.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 overflow-x-auto">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              const Icon = step.icon

              return (
                <div key={step.number} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    isActive ? 'border-blue-500 bg-blue-500' : 
                    isCompleted ? 'border-green-500 bg-green-500' : 
                    'border-gray-600 bg-gray-600'
                  }`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`ml-2 text-sm font-medium whitespace-nowrap ${
                    isActive ? 'text-blue-400' : 
                    isCompleted ? 'text-green-400' : 
                    'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {renderStep}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/20">
            <Button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>

            <div className="flex items-center space-x-4">
              {currentStep === 5 ? (
                <Button
                  onClick={handlePreviewResume}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold"
                >
                  {loading ? 'Enhancing...' : 'Preview Enhanced Resume'}
                </Button>
              ) : currentStep === 6 ? (
                <Button
                  onClick={handleDownloadPreview}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
                >
                  {loading ? 'Generating PDF...' : 'Download Enhanced Resume'}
                </Button>
              ) : (
                <Button
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePage