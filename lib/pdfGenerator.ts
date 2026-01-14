import { chromium } from 'playwright'

export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  let browser
  try {
    // Launch browser with optimal settings for PDF generation
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage()
    
    // Set viewport to match A4 paper size
    await page.setViewportSize({ 
      width: 794,  // A4 width in pixels at 96 DPI
      height: 1123 // A4 height in pixels at 96 DPI
    })

    // Set content with proper waiting
    await page.setContent(html, { 
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // Generate PDF with precise settings
    const pdfBuffer = await page.pdf({
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
    return pdfBuffer

  } catch (error) {
    console.error('PDF generation error:', error)
    if (browser) {
      await browser.close()
    }
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generatePDFFromURL(url: string): Promise<Buffer> {
  let browser
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    })

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle' })

    const pdfBuffer = await page.pdf({
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
    return pdfBuffer

  } catch (error) {
    console.error('PDF generation from URL error:', error)
    if (browser) {
      await browser.close()
    }
    throw new Error(`Failed to generate PDF from URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Alternative method using @react-pdf/renderer (commented out for now)
/*
import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  }
})

export function ResumeDocument({ data }: { data: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>{data.basics.name}</Text>
          <Text>{data.basics.email}</Text>
          <Text>{data.basics.phone}</Text>
        </View>
      </Page>
    </Document>
  )
}
*/