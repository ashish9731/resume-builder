import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ParsedResume } from '../types/resume';

export async function generateResumePDF(
  resume: ParsedResume,
  template: string = 'professional'
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([595, 842]); // A4 size
  
  // Embed fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let yPosition = 800;
  const leftMargin = 50;
  const rightMargin = 545;
  const bottomMargin = 50;
  const lineHeight = 14;
  
  // Function to add new page when needed
  const addNewPageIfNeeded = (requiredSpace: number = 50) => {
    if (yPosition - requiredSpace < bottomMargin) {
      currentPage = pdfDoc.addPage([595, 842]);
      yPosition = 800;
      return true;
    }
    return false;
  };
  
  // Template-specific styling
  let headerFontSize = 18;
  let sectionFontSize = 14;
  let bodyFontSize = 11;
  let bulletFontSize = 10;
  
  switch(template) {
    case 'executive':
      headerFontSize = 20;
      sectionFontSize = 16;
      bodyFontSize = 12;
      bulletFontSize = 11;
      break;
    case 'modern':
      headerFontSize = 19;
      sectionFontSize = 15;
      bodyFontSize = 11;
      bulletFontSize = 10;
      break;
    case 'creative':
      headerFontSize = 17;
      sectionFontSize = 13;
      bodyFontSize = 12;
      bulletFontSize = 11;
      break;
    default:
      // professional
      break;
  }
  
  // Helper function to draw text
  const drawText = (text: string, fontSize: number, font = helvetica, color = rgb(0, 0, 0)) => {
    if (!text) return;
    
    const maxWidth = rightMargin - leftMargin;
    const words = text.split(' ');
    let line = '';
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth > maxWidth && line !== '') {
        currentPage.drawText(line.trim(), {
          x: leftMargin,
          y: yPosition,
          size: fontSize,
          font: font,
          color: color
        });
        yPosition -= fontSize + 4;
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    
    if (line.trim()) {
      currentPage.drawText(line.trim(), {
        x: leftMargin,
        y: yPosition,
        size: fontSize,
        font: font,
        color: color
      });
      yPosition -= fontSize + 4;
    }
  };
  
  // Draw header section
  if (resume.personalInfo.fullName) {
    addNewPageIfNeeded(100); // Reserve space for header
    drawText(resume.personalInfo.fullName, headerFontSize, helveticaBold, rgb(0.1, 0.1, 0.1));
    
    // Contact information
    const contactInfo = [];
    if (resume.personalInfo.email) contactInfo.push(resume.personalInfo.email);
    if (resume.personalInfo.phone) contactInfo.push(resume.personalInfo.phone);
    if (resume.personalInfo.linkedin) contactInfo.push(resume.personalInfo.linkedin);
    
    if (contactInfo.length > 0) {
      drawText(contactInfo.join(' | '), bodyFontSize, helvetica, rgb(0.3, 0.3, 0.3));
    }
    yPosition -= 10;
  }
  
  // Summary section
  if (resume.summary) {
    addNewPageIfNeeded(150); // Reserve space for summary
    drawText('SUMMARY', sectionFontSize, helveticaBold, rgb(0.1, 0.3, 0.6));
    yPosition -= 5;
    drawText(resume.summary, bodyFontSize);
    yPosition -= 15;
  }
  
  // Experience section
  if (resume.experience && resume.experience.length > 0) {
    addNewPageIfNeeded(200); // Reserve space for experience section
    drawText('WORK EXPERIENCE', sectionFontSize, helveticaBold, rgb(0.1, 0.3, 0.6));
    yPosition -= 8;
    
    resume.experience.forEach((exp, index) => {
      if (exp.company && exp.position) {
        // Check if we need a new page for this experience entry
        addNewPageIfNeeded(100);
        
        // Company and position
        drawText(`${exp.company} - ${exp.position}`, bodyFontSize + 1, helveticaBold);
        
        // Duration
        if (exp.duration) {
          drawText(exp.duration, bodyFontSize, helvetica, rgb(0.4, 0.4, 0.4));
        }
        
        // Description
        if (exp.description) {
          const descriptionLines = exp.description.split('\n');
          descriptionLines.forEach(line => {
            if (line.trim()) {
              addNewPageIfNeeded(20); // Space for each bullet point
              drawText(`• ${line.trim()}`, bulletFontSize);
            }
          });
        }
        
        yPosition -= 12;
      }
    });
    yPosition -= 10;
  }
  
  // Skills section
  if (resume.skills) {
    addNewPageIfNeeded(100);
    drawText('SKILLS', sectionFontSize, helveticaBold, rgb(0.1, 0.3, 0.6));
    yPosition -= 8;
    drawText(resume.skills, bodyFontSize);
    yPosition -= 15;
  }
  
  // Education section
  if (resume.education && resume.education.length > 0) {
    addNewPageIfNeeded(100);
    drawText('EDUCATION', sectionFontSize, helveticaBold, rgb(0.1, 0.3, 0.6));
    yPosition -= 8;
    
    resume.education.forEach(edu => {
      if (edu.institution) {
        addNewPageIfNeeded(50);
        drawText(edu.institution, bodyFontSize);
        if (edu.degree) drawText(edu.degree, bulletFontSize, helvetica, rgb(0.4, 0.4, 0.4));
        if (edu.year) drawText(edu.year, bulletFontSize, helvetica, rgb(0.4, 0.4, 0.4));
        yPosition -= 8;
      }
    });
    yPosition -= 10;
  }
  
  // Certifications section
  if (resume.certifications && resume.certifications.length > 0) {
    addNewPageIfNeeded(100);
    drawText('CERTIFICATIONS', sectionFontSize, helveticaBold, rgb(0.1, 0.3, 0.6));
    yPosition -= 8;
    
    resume.certifications.forEach(cert => {
      if (cert.name) {
        addNewPageIfNeeded(30);
        drawText(`${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`, bodyFontSize);
        if (cert.date) drawText(cert.date, bulletFontSize, helvetica, rgb(0.4, 0.4, 0.4));
        yPosition -= 6;
      }
    });
    yPosition -= 10;
  }
  
  // Projects section
  if (resume.projects && resume.projects.length > 0) {
    addNewPageIfNeeded(100);
    drawText('PROJECTS', sectionFontSize, helveticaBold, rgb(0.1, 0.3, 0.6));
    yPosition -= 8;
    
    resume.projects.forEach(proj => {
      if (proj.name) {
        addNewPageIfNeeded(50);
        drawText(proj.name, bodyFontSize);
        if (proj.description) drawText(proj.description, bulletFontSize, helvetica, rgb(0.4, 0.4, 0.4));
        yPosition -= 6;
      }
    });
  }
  
  return await pdfDoc.save();
}