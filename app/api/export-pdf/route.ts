import { NextRequest, NextResponse } from 'next/server'
import { generatePDFBuffer } from '@/lib/pdf/exportResumeToPDF'
import { generateResumeHTML } from '@/lib/generateResumeHTML'
import { ParsedResumeData } from '@/lib/resumeParser'

export async function POST(req: NextRequest) {
  try {
    const { resumeData, template = 'ATS' } = await req.json()

    // Validate input
    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      )
    }

    // Generate HTML using our utility function
    const html = generateResumeHTML(resumeData as ParsedResumeData, template)

    // Generate PDF buffer
    const pdfBuffer = await generatePDFBuffer(html)
    
    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF response
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${template}_Resume.pdf"`
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}