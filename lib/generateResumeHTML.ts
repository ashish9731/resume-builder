import { ParsedResumeData } from './resumeParser'

export function generateResumeHTML(resumeData: any, template: string = 'ATS'): string {
  const isATS = template === 'ATS'
  
  // Handle both data structures
  const isParsedFormat = resumeData.basics !== undefined;
  
  // Generate contact section
  const contactItems = []
  if (isParsedFormat) {
    if (resumeData.basics.email) contactItems.push(`${isATS ? 'Email:' : ''} ${resumeData.basics.email}`)
    if (resumeData.basics.phone) contactItems.push(`${isATS ? 'Phone:' : ''} ${resumeData.basics.phone}`)
    if (resumeData.basics.location) contactItems.push(`${isATS ? 'Location:' : ''} ${resumeData.basics.location}`)
    if (resumeData.basics.linkedin) contactItems.push(`${isATS ? 'LinkedIn:' : ''} ${resumeData.basics.linkedin}`)
  } else {
    // Handle original ResumeData format
    if (resumeData.personalInfo?.email) contactItems.push(`${isATS ? 'Email:' : ''} ${resumeData.personalInfo.email}`)
    if (resumeData.personalInfo?.phone) contactItems.push(`${isATS ? 'Phone:' : ''} ${resumeData.personalInfo.phone}`)
    if (resumeData.personalInfo?.location) contactItems.push(`${isATS ? 'Location:' : ''} ${resumeData.personalInfo.location}`)
    if (resumeData.personalInfo?.linkedin) contactItems.push(`${isATS ? 'LinkedIn:' : ''} ${resumeData.personalInfo.linkedin}`)
  }
  
  const contactSection = contactItems.length > 0 
    ? `<div style="margin-bottom: 24px;">${contactItems.join(isATS ? '<br>' : ' • ')}</div>`
    : ''

  // Generate skills section
  const skillsData = isParsedFormat ? resumeData.skills : (resumeData.skills ? resumeData.skills.split(',').map((s: string) => s.trim()) : []);
  const skillsSection = skillsData && skillsData.length > 0
    ? `<section style="margin-bottom: 24px;" class="break-inside-avoid">
        <h2 style="font-weight: bold; font-size: 18px; text-transform: uppercase; margin-bottom: 12px;">
          ${isATS ? 'Core Skills' : 'Skills'}
        </h2>
        <p style="color: #374151;">${skillsData.join(', ')}</p>
      </section>`
    : ''

  // Generate experience section
  const experienceData = resumeData.experience || [];
  const experienceItems = experienceData.map((exp: any) => {
    const title = isParsedFormat ? exp.title : exp.position;
    const company = exp.company;
    const duration = exp.duration;
    const bullets = isParsedFormat ? exp.bullets : (exp.description ? exp.description.split('\n').filter((line: string) => line.trim()) : []);
    
    return `
    <div style="margin-bottom: 16px; ${isATS ? '' : 'padding-left: 0;'}">
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <h3 style="font-weight: bold; color: #111827;">${title}</h3>
        <span style="font-size: 14px; color: #4b5563;">${duration}</span>
      </div>
      <p style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">${company}</p>
      <ul style="margin: 0; padding-left: 20px;">
        ${bullets.map((bullet: string) => `<li style="margin-bottom: 4px;"><span style="color: #4b5563; margin-right: 8px;">${isATS ? '-' : '•'}</span>${bullet}</li>`).join('')}
      </ul>
    </div>
  `;
  }).join('') || ''

  const experienceSection = experienceItems
    ? `<section style="margin-bottom: 24px;" class="break-inside-avoid">
        <h2 style="font-weight: bold; font-size: 18px; text-transform: uppercase; margin-bottom: 12px;">
          Professional Experience
        </h2>
        <div style="margin-top: 16px;">
          ${experienceItems}
        </div>
      </section>`
    : ''

  // Generate education section
  const educationData = resumeData.education || [];
  const educationItems = educationData.map((edu: any) => `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div>
        <h3 style="font-weight: 600; color: #111827;">${edu.degree}</h3>
        <p style="color: #374151;">${edu.institution}</p>
      </div>
      ${edu.year ? `<span style="font-size: 14px; color: #4b5563;">${edu.year}</span>` : '' }
    </div>
  `).join('') || ''

  const educationSection = educationItems
    ? `<section style="margin-bottom: 24px;" class="break-inside-avoid">
        <h2 style="font-weight: bold; font-size: 18px; text-transform: uppercase; margin-bottom: 12px;">
          Education
        </h2>
        <div style="margin-top: 12px;">
          ${educationItems}
        </div>
      </section>`
    : ''

  // Generate certifications section
  const certificationData = resumeData.certifications || [];
  const certificationItems = certificationData.map((cert: any) => `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="font-weight: 500; color: #1f2937;">${cert.name}</span>
      <span style="font-size: 14px; color: #4b5563;">
        ${cert.issuer}${cert.date ? ` (${cert.date})` : '' }
      </span>
    </div>
  `).join('') || ''

  const certificationsSection = certificationItems
    ? `<section style="margin-bottom: 24px;" class="break-inside-avoid">
        <h2 style="font-weight: bold; font-size: 18px; text-transform: uppercase; margin-bottom: 12px;">
          Certifications
        </h2>
        <div style="margin-top: 8px;">
          ${certificationItems}
        </div>
      </section>`
    : ''

  // Generate projects section
  const projectData = resumeData.projects || [];
  const projectItems = projectData.map((project: any) => `
    <div style="margin-bottom: 12px;">
      <h3 style="font-weight: 600; color: #111827;">${project.name}</h3>
      <p style="color: #374151; margin-bottom: 8px;">${project.description}</p>
      ${project.technologies && project.technologies.length > 0 
        ? `<p style="font-size: 14px; color: #4b5563;">Technologies: ${Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}</p>`
        : '' }
    </div>
  `).join('') || ''

  const projectsSection = projectItems
    ? `<section style="margin-bottom: 24px;" class="break-inside-avoid">
        <h2 style="font-weight: bold; font-size: 18px; text-transform: uppercase; margin-bottom: 12px;">
          Projects
        </h2>
        <div style="margin-top: 12px;">
          ${projectItems}
        </div>
      </section>`
    : ''

  // Main HTML structure
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: ${isATS ? 'Arial, sans-serif' : 'system-ui, -apple-system, sans-serif'};
            margin: 0;
            padding: 32px;
            line-height: 1.6;
            color: #111827;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
          }
          section {
            page-break-inside: avoid;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          h1, h2, h3 {
            margin: 0;
            padding: 0;
          }
          h1 {
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
          }
          h2 {
            border-bottom: ${isATS ? 'none' : '2px solid #3b82f6'};
            padding-bottom: 4px;
          }
          ul, ol {
            margin: 0;
            padding-left: 20px;
          }
          li {
            margin-bottom: 4px;
          }
        </style>
      </head>
      <body>
        <h1>${isParsedFormat ? resumeData.basics.name : (resumeData.personalInfo?.fullName || 'Candidate Name')}</h1>
        ${contactSection}
        
        ${resumeData.summary ? `
          <section style="margin-bottom: 24px;" class="break-inside-avoid">
            <h2 style="font-weight: bold; font-size: 18px; text-transform: uppercase; margin-bottom: 12px;">
              Professional Summary
            </h2>
            <p style="color: #374151; line-height: 1.6;">${resumeData.summary}</p>
          </section>
        ` : ''}
        
        ${skillsSection}
        ${experienceSection}
        ${educationSection}
        ${certificationsSection}
        ${projectsSection}
      </body>
    </html>
  `
}