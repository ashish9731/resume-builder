import { NextRequest, NextResponse } from 'next/server'
import { generatePDFBuffer } from '@/lib/pdf/exportResumeToPDF'
import ReactDOMServer from 'react-dom/server'
import ATSResume from '@/templates/ATS'
import ModernResume from '@/templates/Modern'
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

    // Select template component
    const TemplateComponent = template === 'Modern' ? ModernResume : ATSResume

    // Generate HTML with proper styling
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              line-height: 1.6;
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
          ${ReactDOMServer.renderToStaticMarkup(
            TemplateComponent({ data: resumeData as ParsedResumeData })
          )}
        </body>
      </html>
    `

    // Generate PDF buffer
    const pdfBuffer = await generatePDFBuffer(html)

    // Return PDF response
    return new NextResponse(pdfBuffer, {
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