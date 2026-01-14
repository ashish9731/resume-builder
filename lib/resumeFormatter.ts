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

// Helper function for safe property access
function safe(value?: string): string {
  return value ?? '';
}

export function formatResumeForDisplay(resumeData: Partial<ResumeData>): string {
  let resumeText = ''

  // 1. Full Name
  const personal = resumeData.personalInfo ?? {
    fullName: 'Candidate Name',
    title: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    website: ''
  };

  resumeText += `${personal.fullName}\n`;
  if (personal.title) resumeText += `${personal.title}\n`;

  resumeText += `${[personal.location].filter(Boolean).join(', ')} | `;
  resumeText += `${personal.phone || ''} | `;
  resumeText += `${personal.email || ''} | `;
  resumeText += `${personal.linkedin || ''}\n\n`;

  // Contact information already handled above with safe defaults

  // Job Title already handled above

  // 4. Professional Summary
  if (safe(resumeData.summary)) {
    resumeText += `PROFESSIONAL SUMMARY
${safe(resumeData.summary)}


`
  }

  // Duplicate summary section removed

  // 6. Core Areas of Expertise
  if (safe(resumeData.skills)) {
    resumeText += `CORE AREAS OF EXPERTISE\n`
    // Convert comma-separated skills to bullet points
    const skillsList = safe(resumeData.skills)
      .split(/[•,]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .map(skill => `- ${skill}`)
      .join('\n');
    resumeText += `${skillsList}\n\n\n`
  }

  // 7. Experience
  const experience = Array.isArray(resumeData.experience) ? resumeData.experience : [];
  if (experience.some(exp => safe(exp.company))) {
    resumeText += `EXPERIENCE\n\n`
    experience.forEach((exp, index) => {
      if (safe(exp.company)) {
        // Job Title - Company, Location
        resumeText += `${safe(exp.position)} - ${safe(exp.company)}`
        if (personal.location) {
          resumeText += `, ${personal.location}`
        }
        resumeText += `\n${safe(exp.duration)}\n`
        
        // Description with bullet points
        if (safe(exp.description)) {
          const bullets = safe(exp.description)
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
  const education = Array.isArray(resumeData.education) ? resumeData.education : [];
  if (education.length > 0) {
    resumeText += `EDUCATION\n\n`
    education.forEach(edu => {
      if (safe(edu.institution)) {
        resumeText += `${safe(edu.degree)}\n${safe(edu.institution)}\n\n`
      }
    })
  }

  // 9. Key Skills
  if (safe(resumeData.skills)) {
    resumeText += `KEY SKILLS\n`
    // Convert comma-separated skills to bullet points
    const skillsList = safe(resumeData.skills)
      .split(/[•,]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .map(skill => `- ${skill}`)
      .join('\n');
    resumeText += `${skillsList}\n\n\n`
  }

  // 10. Certifications
  const certifications = Array.isArray(resumeData.certifications) ? resumeData.certifications : [];
  if (certifications.some(cert => safe(cert.name))) {
    resumeText += `CERTIFICATIONS\n\n`
    certifications.forEach(cert => {
      if (safe(cert.name)) {
        resumeText += `- ${safe(cert.name)} (${safe(cert.issuer)}${safe(cert.date) ? ` - ${safe(cert.date)}` : ''})\n`
      }
    })
    resumeText += `\n`
  }

  // Duplicate certifications section removed



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