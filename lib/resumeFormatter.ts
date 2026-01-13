export interface ResumeData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    linkedin?: string
    location?: string
    website?: string
  }
  summary: string
  experience: Array<{
    company: string
    position: string
    duration: string
    description: string
  }>
  skills: string
  projects: Array<{
    name: string
    description: string
    technologies: string
  }>
  certifications: Array<{
    name: string
    issuer: string
    date: string
  }>
  achievements?: Array<{
    title: string
    description: string
  }>
}

export function formatResumeForDisplay(resumeData: ResumeData): string {
  let resumeText = ''

  // Name
  if (resumeData.personalInfo.fullName) {
    resumeText += `${resumeData.personalInfo.fullName}\n`
  }

  // Contact Information
  const contactInfo = []
  if (resumeData.personalInfo.email) contactInfo.push(resumeData.personalInfo.email)
  if (resumeData.personalInfo.phone) contactInfo.push(resumeData.personalInfo.phone)
  if (resumeData.personalInfo.linkedin) contactInfo.push(resumeData.personalInfo.linkedin)
  
  if (contactInfo.length > 0) {
    resumeText += `${contactInfo.join(' | ')}\n`
  }

  // Summary
  if (resumeData.summary) {
    resumeText += `\nSUMMARY\n${resumeData.summary}\n`
  }

  // Work Experience
  if (resumeData.experience && resumeData.experience.some(exp => exp.company)) {
    resumeText += `\nWORK EXPERIENCE\n`
    resumeData.experience.forEach((exp, index) => {
      if (exp.company) {
        resumeText += `\n${exp.company} - ${exp.position} - ${exp.duration}\n`
        if (exp.description) {
          resumeText += `${exp.description}\n`
        }
      }
    })
  }

  // Skills
  if (resumeData.skills) {
    resumeText += `\nSKILLS\n${resumeData.skills}\n`
  }

  // Certifications
  if (resumeData.certifications && resumeData.certifications.some(cert => cert.name)) {
    resumeText += `\nCERTIFICATIONS\n`
    resumeData.certifications.forEach(cert => {
      if (cert.name) {
        resumeText += `${cert.name} - ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}\n`
      }
    })
  }

  // Achievements (only show if they exist)
  if (resumeData.achievements && resumeData.achievements.some(ach => ach.title)) {
    resumeText += `\nACHIEVEMENTS\n`
    resumeData.achievements.forEach(ach => {
      if (ach.title) {
        resumeText += `• ${ach.title}\n`
        if (ach.description) {
          resumeText += `  ${ach.description}\n`
        }
      }
    })
  }

  return resumeText.trim()
}

export function formatResumeForPDF(resumeData: ResumeData, template: string = 'professional'): string {
  // Same formatting logic but with template-specific styling considerations
  return formatResumeForDisplay(resumeData)
}

export function parseRawResumeText(text: string): ResumeData {
  // This function would parse raw text back into structured data
  // For now, returning a basic structure
  return {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      location: '',
      website: ''
    },
    summary: '',
    experience: [],
    skills: '',
    projects: [],
    certifications: [],
    achievements: []
  }
}