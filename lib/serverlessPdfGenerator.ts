import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export async function generatePDFFromHTMLServerless(html: string): Promise<Buffer> {
  let browser
  try {
    // Use @sparticuz/chromium for serverless environments
    const executablePath = await chromium.executablePath()
    
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        ...chromium.args,
        '--hide-scrollbars',
        '--disable-web-security',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    })

    const page = await browser.newPage()
    
    // Set viewport to match A4 paper size
    await page.setViewport({ 
      width: 794,  // A4 width in pixels at 96 DPI
      height: 1123 // A4 height in pixels at 96 DPI
    })

    // Set content with proper waiting
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    })

    // Generate PDF with precise settings
    const pdfArrayBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.8in',
        right: '0.8in',
        bottom: '0.8in',
        left: '0.8in'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false
    })

    await browser.close()
    // Convert ArrayBuffer to Buffer
    return Buffer.from(pdfArrayBuffer)

  } catch (error) {
    console.error('Serverless PDF generation error:', error)
    if (browser) {
      await browser.close()
    }
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generatePDFFromURLServerless(url: string): Promise<Buffer> {
  let browser
  try {
    const executablePath = await chromium.executablePath()
    
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    })

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle0' })

    const pdfArrayBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.8in',
        right: '0.8in',
        bottom: '0.8in',
        left: '0.8in'
      }
    })

    await browser.close()
    // Convert ArrayBuffer to Buffer
    return Buffer.from(pdfArrayBuffer)

  } catch (error) {
    console.error('Serverless PDF generation from URL error:', error)
    if (browser) {
      await browser.close()
    }
    throw new Error(`Failed to generate PDF from URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}