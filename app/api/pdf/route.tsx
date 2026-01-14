import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

function createResumePDF(text: string, template: string = 'professional'): Buffer {
  // Split text into lines but preserve empty lines for proper spacing
  const lines = text.split('\n');
  
  let contentStream = ''
  let yPos = 750
  const leftMargin = 50
  
  // Template-specific adjustments
  let headerFontSize = 14;
  let bodyFontSize = 12;
  let bulletFontSize = 11;
  
  // Adjust formatting based on template
  switch(template) {
    case 'executive':
      headerFontSize = 16;
      bodyFontSize = 11;
      bulletFontSize = 10;
      break;
    case 'modern':
      headerFontSize = 15;
      bodyFontSize = 12;
      bulletFontSize = 11;
      break;
    case 'creative':
      headerFontSize = 13;
      bodyFontSize = 13;
      bulletFontSize = 12;
      break;
    case 'minimal':
      headerFontSize = 14;
      bodyFontSize = 11;
      bulletFontSize = 10;
      break;
    default: // professional
      headerFontSize = 14;
      bodyFontSize = 12;
      bulletFontSize = 11;
  }
  
  // Define section headers for styling
  const sectionHeaders = [
    'NAME', 'CONTACT', 'SUMMARY', 'WORK EXPERIENCE', 'EXPERIENCE', 
    'SKILLS', 'CERTIFICATIONS', 'ACHIEVEMENTS', 'PROJECTS', 'EDUCATION'
  ];
  
  // Build content stream properly
  contentStream += `BT\n`
  
  let previousLineWasEmpty = false;
  
  lines.forEach((line, index) => {
    const cleanLine = line;
    const isEmptyLine = cleanLine.trim() === '';
    
    // Handle empty lines for spacing
    if (isEmptyLine) {
      if (!previousLineWasEmpty) {
        // Add extra spacing for paragraph breaks
        yPos -= 15;
      }
      previousLineWasEmpty = true;
      return;
    }
    
    previousLineWasEmpty = false;
    
    const escapedText = escapePDFText(cleanLine)
    
    // Determine font based on line content
    let font = '/F2'; // Regular font
    let fontSize = bodyFontSize;
    let lineHeight = fontSize + 3;
    
    // Check if this is a section header
    const upperLine = cleanLine.trim().toUpperCase();
    const isSectionHeader = sectionHeaders.some(header => 
      upperLine === header || upperLine.includes(header)
    );
    
    if (isSectionHeader) {
      font = '/F1'; // Bold font for section headers
      fontSize = headerFontSize;
      lineHeight = fontSize + 6; // Extra spacing after headers
    } else if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
      // Bullet points
      font = '/F2';
      fontSize = bulletFontSize;
      lineHeight = fontSize + 3;
    } else if (cleanLine.includes(' - ') && cleanLine.split(' - ').length >= 2) {
      // Experience/company lines
      font = '/F1'; // Semi-bold for company/role lines
      fontSize = bodyFontSize + 1;
      lineHeight = fontSize + 4;
    } else if (cleanLine.match(/^[^@]+@[\w.-]+\.[\w.-]+/) || cleanLine.match(/^\(\d{3}\)\s*\d{3}-\d{4}/)) {
      // Contact info (email or phone)
      font = '/F2';
      fontSize = bulletFontSize;
      lineHeight = fontSize + 3;
    } else {
      // Regular body text
      font = '/F2';
      fontSize = bodyFontSize;
      lineHeight = fontSize + 3;
    }
    
    contentStream += `${font} ${fontSize} Tf\n`;
    
    if (index === 0) {
      contentStream += `${leftMargin} ${yPos} Td\n(${escapedText}) Tj\n`
    } else {
      contentStream += `0 -${lineHeight} Td\n(${escapedText}) Tj\n`
    }
    
    yPos -= lineHeight;
    
    // Add extra space after section headers
    if (font === '/F1' && fontSize === headerFontSize) {
      yPos -= 15;
    }
    
    // Check if we're running out of space
    if (yPos < 50) {
      // For simplicity, we'll just stop adding content
      // In a real implementation, we'd add a new page
      return;
    }
  })
  
  contentStream += `ET`
  
  const pdfContent = generatePDFStructure(contentStream)
  return Buffer.from(pdfContent, 'ascii')
}

function escapePDFText(text: string): string {
  // First, remove or replace problematic characters that cause WinAnsi encoding errors
  return text
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\uFFFF]/g, ' ') // Remove all non-ASCII and control characters
    .replace(/[\n\r]/g, ' ') // Replace newlines and carriage returns with spaces
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/\(/g, '\\(') // Escape opening parentheses
    .replace(/\)/g, '\\)') // Escape closing parentheses
    .replace(/[^\x20-\x7E]/g, ' ') // Final cleanup: only ASCII printable characters
    .trim()
}

function generatePDFStructure(content: string): string {
  const obj1 = `1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj`

  const obj2 = `2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj`

  const obj3 = `3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
/F2 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj`

  const obj4 = `4 0 obj
<<
/Length ${content.length}
>>
stream
${content}
endstream
endobj`

  const xrefOffset = 9 + obj1.length + 1 + obj2.length + 1 + obj3.length + 1 + obj4.length + 1
  
  return `%PDF-1.4
${obj1}
${obj2}
${obj3}
${obj4}

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000059 00000 n 
0000000116 00000 n 
0000000254 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${xrefOffset}
%%EOF`
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let text: string
    let template: string = 'professional'

    if (contentType.includes('application/json')) {
      const body = await req.json()
      text = body.text
      template = body.template || 'professional'
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      text = formData.get('text') as string
      template = (formData.get('template') as string) || 'professional'
    } else {
      // Fallback to text from body
      text = await req.text()
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required and must be a string' },
        { status: 400 }
      )
    }

    // Pre-clean the text to prevent encoding issues
    const cleanText = text
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\uFFFF]/g, ' ') // Remove problematic characters
      .replace(/[\n\r]+/g, '\n') // Normalize line endings
      .replace(/[ \t]+/g, ' ') // Normalize whitespace
      .trim()
    
    if (!cleanText) {
      return NextResponse.json(
        { error: 'No content to generate PDF' },
        { status: 400 }
      )
    }

    const lines = cleanText.split('\n').filter(line => line.trim().length > 0)
    console.log('Generating PDF with', lines.length, 'lines of content using template:', template)

    // Generate PDF
    const pdfBuffer = createResumePDF(cleanText, template)
    
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes')

    // Convert to Uint8Array for Response
    const pdfBytes = new Uint8Array(pdfBuffer)
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="enhanced-resume-${template}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
