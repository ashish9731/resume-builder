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

    // Clean the text
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\|/g, '')
      .replace(/\//g, '')
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '')
      .replace(/---/g, '')
      .replace(/--/g, '')
      .replace(/__/g, '')
      .replace(/_/g, '')
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '')
      .replace(/\{/g, '')
      .replace(/\}/g, '')
      .replace(/\+/g, '')
      .replace(/=/g, '')
      .replace(/~/g, '')
      .replace(/`/g, '')
      .replace(/\^/g, '')
      .replace(/&/g, '')
      .replace(/%/g, '')
      .replace(/\$/g, '')
      .replace(/@/g, '')
      .replace(/!/g, '')
      .replace(/\?/g, '')
      .replace(/:/g, '')
      .replace(/;/g, '')
      .replace(/"/g, '')
      .replace(/'/g, '')
      .replace(/</g, '')
      .replace(/>/g, '')
      .replace(/\\/g, '')
      .replace(/This revised resume emphasizes.*?ATS compatibility\./g, '')
      .replace(/This enhanced resume.*?professional standards\./g, '')
      .replace(/The resume has been.*?industry standards\./g, '')
      .replace(/\n\n\n+/g, '\n\n')
      .trim()

    // HTML for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume</title>
          <style>
            @page {
              margin: 0.75in;
              size: A4;
            }
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.4;
              color: #000;
              background: white;
              font-size: 11pt;
            }
            .resume-container {
              max-width: 8.5in;
              margin: 0 auto;
              border: 1px solid #000;
              padding: 20px;
            }
            .resume-content {
              font-size: 11pt;
              line-height: 1.4;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            <div class="resume-content">${cleanText}</div>
          </div>
        </body>
      </html>
    `

    // Puppeteer setup (Vercel or local)
    let browser
    const executablePath = await chromium.executablePath()
    if (executablePath && executablePath.length > 0) {
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
      })
    } else {
      browser = await localPuppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }

    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 })
    await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
    })

    await browser.close()

    // ✅ FIX: use pdfBuffer.buffer (ArrayBuffer) so Response accepts it
const blob = new Blob([pdfBuffer], { type: 'application/pdf' })

return new Response(blob, {
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
