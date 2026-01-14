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

  // 2. Contact Information - Format: Full Name, Country Code - Phone, Email
  const contactParts = []
  
  // Add full name first
  if (resumeData.personalInfo.fullName) {
    contactParts.push(resumeData.personalInfo.fullName);
  }
  
  // Add country code and phone
  if (resumeData.personalInfo.phone) {
    const cleanPhone = resumeData.personalInfo.phone.replace(/[^0-9]/g, '');
    if (cleanPhone) {
      // Default to +91 for India, can be customized
      contactParts.push(`+91-${cleanPhone}`);
    }
  }
  
  // Add email
  if (resumeData.personalInfo.email) {
    contactParts.push(resumeData.personalInfo.email);
  }
  
  if (contactParts.length > 0) {
    resumeText += `${contactParts.join(' - ')}\n`
  }

  // 3. Job Title (if available)
  if (resumeData.personalInfo.title) {
    resumeText += `${resumeData.personalInfo.title}\n\n`
  }

  // 4. Professional Summary
  if (resumeData.summary) {
    resumeText += `PROFESSIONAL SUMMARY
${resumeData.summary}


`
  }

  // 5. Professional Summary (moved from section 4)
  if (resumeData.summary) {
    resumeText += `PROFESSIONAL SUMMARY
${resumeData.summary}


`
  }

  // 6. Core Areas of Expertise
  if (resumeData.skills) {
    resumeText += `CORE AREAS OF EXPERTISE\n`
    // Convert comma-separated skills to bullet points
    const skillsList = resumeData.skills
      .split(/[•,]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .map(skill => `- ${skill}`)
      .join('\n');
    resumeText += `${skillsList}\n\n\n`
  }

  // 7. Experience
  if (resumeData.experience && resumeData.experience.some(exp => exp.company)) {
    resumeText += `EXPERIENCE\n\n`
    resumeData.experience.forEach((exp, index) => {
      if (exp.company) {
        // Job Title - Company, Location
        resumeText += `${exp.position} - ${exp.company}`
        if (resumeData.personalInfo.location) {
          resumeText += `, ${resumeData.personalInfo.location}`
        }
        resumeText += `\n${exp.duration}\n`
        
        // Description with bullet points
        if (exp.description) {
          const bullets = exp.description
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
              // Ensure bullet point formatting
              if (!line.startsWith('•') && !line.startsWith('-')) {
                return `- ${line.trim()}`;
              }
              return line.trim();
            })
            .join('\n');
          resumeText += `${bullets}\n\n`;
        }
      }
    })
  }

  // 8. Education
  if (resumeData.education && resumeData.education.length > 0) {
    resumeText += `EDUCATION\n\n`
    resumeData.education.forEach(edu => {
      if (edu.institution) {
        resumeText += `${edu.degree}\n${edu.institution}\n\n`
      }
    })
  }

  // 9. Key Skills
  if (resumeData.skills) {
    resumeText += `KEY SKILLS\n`
    // Convert comma-separated skills to bullet points
    const skillsList = resumeData.skills
      .split(/[•,]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .map(skill => `- ${skill}`)
      .join('\n');
    resumeText += `${skillsList}\n\n\n`
  }

  // 10. Certifications
  if (resumeData.certifications && resumeData.certifications.some(cert => cert.name)) {
    resumeText += `CERTIFICATIONS\n\n`
    resumeData.certifications.forEach(cert => {
      if (cert.name) {
        resumeText += `- ${cert.name} (${cert.issuer}${cert.date ? ` - ${cert.date}` : ''})\n`
      }
    })
    resumeText += `\n`
  }

  // 9. Certifications - Professional format
  if (resumeData.certifications && resumeData.certifications.some(cert => cert.name)) {
    resumeText += `CERTIFICATIONS\n\n`
    resumeData.certifications.forEach(cert => {
      if (cert.name) {
        resumeText += `${cert.name}\n`
        resumeText += `${cert.issuer}${cert.date ? ` - ${cert.date}` : ''}\n\n`
      }
    })
  }



  // Final cleanup to ensure PDF compatibility and formatting requirements
  const cleanText = resumeText
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\uFFFF]/g, ' ') // Remove non-printable characters
    .replace(/\n+/g, '\n') // Normalize multiple newlines
    .replace(/[ \t]+/g, ' ') // Normalize whitespace
    .replace(/\|/g, '-') // Replace pipe symbols with hyphens
    .replace(/\./g, '-') // Replace periods with hyphens
    .trim();
  
  return cleanText;
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