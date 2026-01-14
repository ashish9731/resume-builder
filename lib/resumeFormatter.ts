export interface ResumeData {
  personalInfo: {
    fullName: string
    title?: string
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
  education?: Array<{
    institution: string
    degree: string
    year: string
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

  // 1. Full Name
  if (resumeData.personalInfo.fullName) {
    resumeText += `${resumeData.personalInfo.fullName}\n`
  }

  // 2. Job Title (if available)
  if (resumeData.personalInfo.title) {
    resumeText += `${resumeData.personalInfo.title}\n`
  }

  // 3. Contact Information - Universal format
  const contactParts = []
  if (resumeData.personalInfo.location) contactParts.push(resumeData.personalInfo.location)
  if (resumeData.personalInfo.phone) contactParts.push(resumeData.personalInfo.phone)
  if (resumeData.personalInfo.email) contactParts.push(resumeData.personalInfo.email)
  if (resumeData.personalInfo.linkedin) contactParts.push(resumeData.personalInfo.linkedin)
  
  if (contactParts.length > 0) {
    resumeText += `${contactParts.join(' | ')}\n\n`
  }

  // 4. Professional Summary
  if (resumeData.summary) {
    resumeText += `PROFESSIONAL SUMMARY
====================
${resumeData.summary}


`
  }

  // 5. Core Skills / Technical Skills
  if (resumeData.skills) {
    resumeText += `CORE SKILLS\n===========\n`
    // Convert comma-separated skills to bullet points
    const skillsList = resumeData.skills
      .split(/[•,]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .map(skill => `• ${skill}`)
      .join('\n');
    resumeText += `${skillsList}\n\n\n`
  }

  // 6. Experience - Professional format
  if (resumeData.experience && resumeData.experience.some(exp => exp.company)) {
    resumeText += `PROFESSIONAL EXPERIENCE\n=======================\n\n`
    resumeData.experience.forEach((exp, index) => {
      if (exp.company) {
        // Job Title
        resumeText += `${exp.position}\n`
        // Company and Location
        resumeText += `${exp.company}`
        if (resumeData.personalInfo.location) {
          resumeText += `, ${resumeData.personalInfo.location}`
        }
        resumeText += `\n`
        // Duration
        resumeText += `${exp.duration}\n\n`
        
        // Description with bullet points
        if (exp.description) {
          const bullets = exp.description
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
              // Ensure bullet point formatting
              if (!line.startsWith('•') && !line.startsWith('-')) {
                return `• ${line.trim()}`;
              }
              return line.trim();
            })
            .join('\n');
          resumeText += `${bullets}\n\n`;
        }
      }
    })
  }

  // 7. Projects (if available)
  if (resumeData.projects && resumeData.projects.some(proj => proj.name)) {
    resumeText += `PROJECTS\n========\n\n`
    resumeData.projects.forEach(proj => {
      if (proj.name) {
        resumeText += `${proj.name}\n`
        if (proj.description) {
          resumeText += `${proj.description}\n`
        }
        if (proj.technologies) {
          resumeText += `Technologies: ${proj.technologies}\n`
        }
        resumeText += `\n`
      }
    })
  }

  // 8. Education Section
  if (resumeData.education && resumeData.education.length > 0) {
    resumeText += `EDUCATION\n=========\n\n`
    resumeData.education.forEach(edu => {
      if (edu.institution) {
        resumeText += `${edu.degree}\n`
        resumeText += `${edu.institution}${edu.year ? ` | ${edu.year}` : ''}\n\n`
      }
    })
  }

  // 9. Certifications - Professional format
  if (resumeData.certifications && resumeData.certifications.some(cert => cert.name)) {
    resumeText += `CERTIFICATIONS\n==============\n\n`
    resumeData.certifications.forEach(cert => {
      if (cert.name) {
        resumeText += `${cert.name}\n`
        resumeText += `${cert.issuer}${cert.date ? ` | ${cert.date}` : ''}\n\n`
      }
    })
  }

  // 10. Languages (placeholder - can be added to data structure)
  // This would be implemented when language data is available in ResumeData
  resumeText += `LANGUAGES\n========\n\n`
  resumeText += `English - Native\n`
  resumeText += `\n`

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