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

  // Name - Bold/Heading format
  if (resumeData.personalInfo.fullName) {
    resumeText += `**${resumeData.personalInfo.fullName.toUpperCase()}**\n\n`
  }

  // Contact Information - Clean format
  const contactInfo = []
  if (resumeData.personalInfo.email) contactInfo.push(resumeData.personalInfo.email)
  if (resumeData.personalInfo.phone) contactInfo.push(resumeData.personalInfo.phone)
  if (resumeData.personalInfo.linkedin) contactInfo.push(resumeData.personalInfo.linkedin)
  if (resumeData.personalInfo.location) contactInfo.push(resumeData.personalInfo.location)
  
  if (contactInfo.length > 0) {
    resumeText += `${contactInfo.join(' • ')}\n\n`
  }

  // Summary Section
  if (resumeData.summary) {
    resumeText += `**SUMMARY**

${resumeData.summary}


`
  }

  // Core Areas of Expertise (if exists in summary)
  if (resumeData.summary && resumeData.summary.includes('CORE AREAS OF EXPERTISE')) {
    // Extract and format core competencies
    const coreAreasMatch = resumeData.summary.match(/CORE AREAS OF EXPERTISE[\s\S]*?(?=\n\n|$)/i);
    if (coreAreasMatch) {
      const coreAreas = coreAreasMatch[0];
      resumeText += `**CORE COMPETENCIES**

${coreAreas.replace('CORE AREAS OF EXPERTISE', '').trim()}


`;
    }
  }

  // Work Experience - Professional format
  if (resumeData.experience && resumeData.experience.some(exp => exp.company)) {
    resumeText += `**PROFESSIONAL EXPERIENCE**\n\n`
    resumeData.experience.forEach((exp, index) => {
      if (exp.company) {
        // Company header
        resumeText += `**${exp.company}**\n`
        resumeText += `${exp.position} | ${exp.duration}\n\n`
        
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

  // Education Section
  if (resumeData.education && resumeData.education.length > 0) {
    resumeText += `**EDUCATION**\n\n`
    resumeData.education.forEach(edu => {
      if (edu.institution) {
        resumeText += `**${edu.degree}**\n`
        resumeText += `${edu.institution}${edu.year ? ` | ${edu.year}` : ''}\n\n`
      }
    })
  }

  // Skills - Enhanced formatting
  if (resumeData.skills) {
    resumeText += `**TECHNICAL SKILLS**\n\n`
    // Convert comma-separated skills to bullet points
    const skillsList = resumeData.skills
      .split(/[•,]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .map(skill => `• ${skill}`)
      .join('\n');
    resumeText += `${skillsList}\n\n\n`
  }

  // Certifications - Professional format
  if (resumeData.certifications && resumeData.certifications.some(cert => cert.name)) {
    resumeText += `**CERTIFICATIONS**\n\n`
    resumeData.certifications.forEach(cert => {
      if (cert.name) {
        resumeText += `• **${cert.name}**\n`
        resumeText += `  ${cert.issuer}${cert.date ? ` | ${cert.date}` : ''}\n\n`
      }
    })
  }

  // Projects (if available)
  if (resumeData.projects && resumeData.projects.some(proj => proj.name)) {
    resumeText += `**PROJECTS**\n\n`
    resumeData.projects.forEach(proj => {
      if (proj.name) {
        resumeText += `• **${proj.name}**\n`
        if (proj.description) {
          resumeText += `  ${proj.description}\n`
        }
        if (proj.technologies) {
          resumeText += `  Technologies: ${proj.technologies}\n`
        }
        resumeText += `\n`
      }
    })
  }

  // Achievements - Formatted
  if (resumeData.achievements && resumeData.achievements.some(ach => ach.title)) {
    resumeText += `**PROFESSIONAL ACHIEVEMENTS**\n\n`
    resumeData.achievements.forEach(ach => {
      if (ach.title) {
        resumeText += `• ${ach.title}\n`
        if (ach.description) {
          resumeText += `  ${ach.description}\n\n`
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