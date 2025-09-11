import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

function createResumePDF(text: string): Buffer {
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  
  let content = ''
  let yPos = 750
  const lineHeight = 14
  const leftMargin = 50
  const rightMargin = 550
  const pageWidth = 600
  
  for (const line of lines) {
    const cleanLine = line.trim()
    
    if (cleanLine.length === 0) {
      yPos -= lineHeight
      continue
    }
    
    // Handle different line types
    if (cleanLine.includes(' | ')) {
      // Header/contact info
      content += `${leftMargin} ${yPos} Td (${escapePDFString(cleanLine)}) Tj\n`
      yPos -= lineHeight
    } else if (cleanLine.startsWith('•')) {
      // Bullet points
      const bulletText = cleanLine.substring(1).trim()
      content += `${leftMargin + 10} ${yPos} Td (• ${escapePDFString(bulletText)}) Tj\n`
      yPos -= lineHeight
    } else if (cleanLine.toUpperCase() === cleanLine && cleanLine.length > 3 && !cleanLine.includes(' ')) {
      // Section headers
      content += `${leftMargin} ${yPos} Td (${escapePDFString(cleanLine)}) Tj\n`
      yPos -= lineHeight + 4
    } else {
      // Regular text
      content += `${leftMargin} ${yPos} Td (${escapePDFString(cleanLine)}) Tj\n`
      yPos -= lineHeight
    }
    
    if (yPos < 50) {
      // Add new page logic if needed
      break
    }
  }

  const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
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
/BaseFont /Helvetica
>>
>>
>>
>>
endobj

4 0 obj
<<
/Length ${content.length}
>>
stream
BT
/F1 12 Tf
${content}
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000253 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${400 + content.length}
%%EOF`

  return Buffer.from(pdfHeader, 'ascii')
}

function escapePDFString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\n/g, ' ')
}

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required and must be a string' },
        { status: 400 }
      )
    }

    // Clean the text further to ensure no artifacts
    const cleanText = text
      .replace(/\*{2,}/g, '') // Remove ** bold markers
      .replace(/^#+\s*/gm, '') // Remove # headers
      .replace(/^\d+\.\s*/gm, '') // Remove numbered lists
      .replace(/\n{3,}/g, '\n\n') // Normalize spacing
      .trim()

    // Generate PDF
    const pdfBuffer = createResumePDF(cleanText)

    // Return PDF response
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="enhanced-resume.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
