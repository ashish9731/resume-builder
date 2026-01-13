import { ResumeData, ParsedResume } from '../types/resume';

export function parseResume(text: string): ParsedResume {
  const cleanText = text.replace(/\n{2,}/g, '\n').trim();
  
  // Split into sections by looking for capitalized section headers
  const sections = cleanText.split(/\n(?=[A-Z][A-Z\s]{3,}:?)/);
  
  const resume: ParsedResume = {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      location: ''
    },
    summary: '',
    experience: [],
    skills: '',
    education: [],
    certifications: [],
    projects: []
  };

  // Extract personal info from first section or header area
  const firstSection = sections[0] || cleanText;
  extractPersonalInfo(firstSection, resume);

  sections.forEach(section => {
    const upper = section.toUpperCase();
    
    // Summary section
    if (upper.includes('SUMMARY') || upper.includes('PROFILE') || upper.includes('ABOUT ME')) {
      resume.summary = section
        .replace(/SUMMARY:?|PROFILE:?|ABOUT ME:?/i, '')
        .replace(/^[^\w\n]*\n?/, '')
        .trim();
    }
    
    // Skills section
    if (upper.includes('SKILLS') || upper.includes('COMPETENCIES') || upper.includes('TECHNICAL')) {
      const skillsText = section
        .replace(/SKILLS:?|COMPETENCIES:?|TECHNICAL:?/i, '')
        .replace(/^[^\w\n]*\n?/, '')
        .trim();
      
      // Split by commas, newlines, or bullet points
      resume.skills = skillsText
        .split(/[,|\n•\-–—]/)
        .map(s => s.trim())
        .filter(s => s.length > 1)
        .join(', ');
    }
    
    // Experience section
    if (upper.includes('EXPERIENCE') || upper.includes('WORK') || upper.includes('EMPLOYMENT')) {
      parseExperienceSection(section, resume);
    }
    
    // Education section
    if (upper.includes('EDUCATION') || upper.includes('ACADEMIC')) {
      const eduLines = section
        .replace(/EDUCATION:?|ACADEMIC:?/i, '')
        .split('\n')
        .filter(line => line.trim() && !/^[A-Z\s]+$/.test(line.trim()));
      
      eduLines.forEach(line => {
        if (line.trim()) {
          resume.education.push({
            institution: line.trim(),
            degree: '',
            year: ''
          });
        }
      });
    }
    
    // Certifications section
    if (upper.includes('CERTIFICATION') || upper.includes('CERTIFICATIONS')) {
      const certLines = section
        .replace(/CERTIFICATION:?|CERTIFICATIONS:?/i, '')
        .split('\n')
        .filter(line => line.trim() && !/^[A-Z\s]+$/.test(line.trim()));
      
      certLines.forEach(line => {
        if (line.trim()) {
          resume.certifications.push({
            name: line.trim(),
            issuer: '',
            date: ''
          });
        }
      });
    }
    
    // Projects section
    if (upper.includes('PROJECTS') || upper.includes('PROJECT')) {
      const projectLines = section
        .replace(/PROJECTS:?|PROJECT:?/i, '')
        .split('\n')
        .filter(line => line.trim() && !/^[A-Z\s]+$/.test(line.trim()));
      
      projectLines.forEach(line => {
        if (line.trim() && !line.startsWith('-') && !line.startsWith('•')) {
          resume.projects.push({
            name: line.trim(),
            description: ''
          });
        }
      });
    }
  });

  return resume;
}

function extractPersonalInfo(text: string, resume: ParsedResume) {
  // Extract name (usually first line that looks like a name)
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(trimmed) && trimmed.split(' ').length <= 4) {
      resume.personalInfo.fullName = trimmed;
      break;
    }
  }
  
  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    resume.personalInfo.email = emailMatch[0];
  }
  
  // Extract phone
  const phoneMatch = text.match(/(\+?1?-?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
  if (phoneMatch) {
    resume.personalInfo.phone = phoneMatch[0];
  }
  
  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/i);
  if (linkedinMatch) {
    resume.personalInfo.linkedin = linkedinMatch[0];
  }
}

function parseExperienceSection(section: string, resume: ParsedResume) {
  // Remove section header
  const content = section.replace(/EXPERIENCE:?|WORK:?|EMPLOYMENT:?/i, '').trim();
  
  // Split by company/role patterns
  const experienceBlocks = content.split(/\n(?=[A-Z][^(]*\s+at\s+[A-Z]|^[A-Z][^(]*\s+\([^)]+\))/);
  
  experienceBlocks.forEach(block => {
    if (!block.trim()) return;
    
    const lines = block.split('\n').filter(line => line.trim());
    if (lines.length < 2) return;
    
    // Extract role and company
    const roleCompanyLine = lines[0];
    if (!roleCompanyLine) return;
    
    const roleCompanyMatch = roleCompanyLine.match(/^([^(]+?)\s*(?:at|@)\s*([^(]+?)(?:\s*[\[(])?/i) ||
                           roleCompanyLine.match(/^([^(]+?)\s*\(([^)]+)\)/);
    
    if (roleCompanyMatch) {
      const [, role, company] = roleCompanyMatch;
      
      // Extract duration
      let duration = '';
      const durationMatch = roleCompanyLine.match(/[\[(][^)\]]*[0-9]{4}[^)\]]*[\])]/);
      if (durationMatch) {
        duration = durationMatch[0].replace(/[[\]()]/g, '').trim();
      }
      
      // Extract description/bullet points
      const descriptionLines = lines.slice(1).filter(line => 
        line.trim() && !/^[A-Z\s]+$/.test(line.trim())
      );
      
      const description = descriptionLines
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0)
        .join('\n');
      
      resume.experience.push({
        company: company?.trim() || '',
        position: role?.trim() || '',
        duration: duration,
        description: description
      });
    }
  });
}