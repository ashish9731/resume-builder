import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

function createResumePDF(text: string): Buffer {
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  
  let pdfContent = ''
  let yPos = 750
  const lineHeight = 18
  const leftMargin = 50
  
  // Start content stream
  pdfContent += `BT\n/F1 12 Tf\n50 750 Td\n`
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() || ''
    if (!line) continue
    
    // Escape and prepare text
    const escapedLine = escapePDFString(line)
    
    // Add line to content
    if (i === 0) {
      pdfContent += `(${escapedLine}) Tj\n`
    } else {
      pdfContent += `0 -${lineHeight} Td (${escapedLine}) Tj\n`
    }
    
    yPos -= lineHeight
    
    if (yPos < 100) {
      break // Prevent going off page
    }
  }
  
  pdfContent += `ET`
  
  const pdfStructure = `%PDF-1.4
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
/Length ${pdfContent.length}
>>
stream
${pdfContent}
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
${400 + pdfContent.length}
%%EOF`

  return Buffer.from(pdfStructure, 'ascii')
}

function escapePDFString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .trim()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required and must be a string' },
        { status: 400 }
      )
    }

    // Ensure we have actual content
    const cleanText = text.trim()
    if (!cleanText) {
      return NextResponse.json(
        { error: 'No content to generate PDF' },
        { status: 400 }
      )
    }

    console.log('Generating PDF with content:', cleanText.substring(0, 200) + '...')

    // Generate PDF
    const pdfBuffer = createResumePDF(cleanText)
    
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes')

    // Convert Buffer to Uint8Array for proper Response handling
    const pdfArray = new Uint8Array(pdfBuffer)
    
    return new Response(pdfArray, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="enhanced-resume.pdf"',
        'Content-Length': pdfArray.length.toString(),
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
