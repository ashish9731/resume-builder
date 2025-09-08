import { NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteerCore from 'puppeteer-core'
import localPuppeteer from 'puppeteer'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Clean the text and remove all formatting characters and branding
    const cleanText = text
      .replace(/\*\*/g, '')
      // ... [all your replace calls remain the same]
      .replace(/\n\n\n+/g, '\n\n')
      .trim()

    // Create clean, professional HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume</title>
          <style>
            @page { margin: 0.75in; size: A4; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; line-height: 1.4; color: #000; background: white; font-size: 11pt; }
            .resume-container { max-width: 8.5in; margin: 0 auto; border: 1px solid #000; padding: 20px; }
            .resume-content { font-size: 11pt; line-height: 1.4; white-space: pre-wrap; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="resume-container">
            <div class="resume-content">${cleanText}</div>
          </div>
        </body>
      </html>
    `

    // Puppeteer setup
    let browser
    let pdfBuffer
    try {
      const executablePath = await chromium.executablePath()
      if (executablePath && executablePath.length > 0) {
        browser = await puppeteerCore.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath,
          headless: chromium.headless,
        })
      } else {
        // Local fallback
        browser = await localPuppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })
      }

      const page = await browser.newPage()
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1
      })
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      })
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in'
        },
        displayHeaderFooter: false
      })
      await browser.close()
    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr)
      return NextResponse.json({ error: 'PDF generation failed', details: String(pdfErr) }, { status: 500 })
    }

    // Send the PDF as a download
    return new NextResponse(Buffer.from(pdfBuffer), {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="resume.pdf"',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
  },
})

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to process request', details: String(error) }, { status: 500 })
  }
}
