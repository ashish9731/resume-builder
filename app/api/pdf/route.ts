import { NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteerCore from 'puppeteer-core'
import localPuppeteer from 'puppeteer'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    // Accept JSON input
    const { html, text } = await request.json()

    let content = ''

    if (html) {
      // Use provided HTML directly
      content = html
    } else if (text) {
      // Clean text and wrap in HTML template
      const cleanText = text
        .replace(/\*\*|\*|\||\/|###|##|#|---|--|__|_/g, '')
        .replace(/\[|\]|\(|\)|\{|\}|\+|=|~|`|\^|&|%|\$|@|!|\?|:|;|"|'|<|>|\\/g, '')
        .replace(/This revised resume emphasizes.*?ATS compatibility\./g, '')
        .replace(/This enhanced resume.*?professional standards\./g, '')
        .replace(/The resume has been.*?industry standards\./g, '')
        .replace(/\n\n\n+/g, '\n\n')
        .trim()

      content = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Resume</title>
            <style>
              @page { margin: 0.75in; size: A4; }
              body { font-family: 'Times New Roman', serif; line-height: 1.4; font-size: 11pt; }
              .resume-container { max-width: 8.5in; margin: 0 auto; border: 1px solid #000; padding: 20px; }
              .resume-content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="resume-container">
              <div class="resume-content">${cleanText}</div>
            </div>
          </body>
        </html>
      `
    } else {
      return NextResponse.json({ error: 'No HTML or text provided' }, { status: 400 })
    }

    // Launch Puppeteer
    let browser
    try {
      const executablePath = await chromium.executablePath()
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
      })
    } catch {
      // fallback for local development
      browser = await localPuppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }

    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })
    await page.setContent(content, { waitUntil: 'networkidle0', timeout: 30000 })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
      preferCSSPageSize: true,
    })

    await browser.close()

    // Wrap buffer in Uint8Array to fix TypeScript / Next.js issue
    const uint8Array = new Uint8Array(pdfBuffer)

    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
