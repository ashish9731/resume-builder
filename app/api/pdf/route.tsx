import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

function createResumePDF(text: string): Buffer {
  const lines = text.split('\n');
  
  let contentStream = ''
  let yPos = 750
  const leftMargin = 50
  
  // Build content stream properly
  contentStream += `BT\n`
  
  lines.forEach((line, index) => {
    const cleanLine = line;
    const escapedText = escapePDFText(cleanLine)
    
    // Determine font based on line content
    let font = '/F2'; // Regular font
    let fontSize = 12;
    let lineHeight = 15;
    
    // Check if this is a header (all caps, short, or specific patterns)
    if (cleanLine.toUpperCase() === cleanLine && cleanLine.length < 50 && cleanLine.includes(' ')) {
      font = '/F1'; // Bold font
      fontSize = 14;
      lineHeight = 18;
    } else if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
      // Bullet points
      font = '/F2';
      fontSize = 11;
      lineHeight = 14;
    } else if (cleanLine.match(/^([A-Z][a-z]+\s*)+\|/)) {
      // Contact info line
      font = '/F2';
      fontSize = 11;
      lineHeight = 14;
    }
    
    contentStream += `${font} ${fontSize} Tf\n`;
    
    if (index === 0) {
      contentStream += `${leftMargin} ${yPos} Td\n(${escapedText}) Tj\n`
    } else {
      contentStream += `0 -${lineHeight} Td\n(${escapedText}) Tj\n`
    }
    
    yPos -= lineHeight;
    
    // Add extra space after section headers
    if (font === '/F1' && fontSize === 14) {
      yPos -= 10;
    }
  })
  
  contentStream += `ET`
  
  const pdfContent = generatePDFStructure(contentStream)
  return Buffer.from(pdfContent, 'ascii')
}

function escapePDFText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' ') // Replace non-printable chars with space
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

    if (contentType.includes('application/json')) {
      const body = await req.json()
      text = body.text
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      text = formData.get('text') as string
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

    const cleanText = text.trim()
    if (!cleanText) {
      return NextResponse.json(
        { error: 'No content to generate PDF' },
        { status: 400 }
      )
    }

    const lines = cleanText.split('\n').filter(line => line.trim().length > 0)
    console.log('Generating PDF with', lines.length, 'lines of content')

    // Generate PDF
    const pdfBuffer = createResumePDF(cleanText)
    
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes')

    // Convert to Uint8Array for Response
    const pdfBytes = new Uint8Array(pdfBuffer)
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="enhanced-resume.pdf"',
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
