import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

export async function exportResumeToPDF(html: string, outputPath: string) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.setContent(html, {
    waitUntil: 'networkidle'
  })

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm'
    }
  })

  await browser.close()
}

export async function generatePDFBuffer(html: string): Promise<Buffer> {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.setContent(html, {
    waitUntil: 'networkidle'
  })

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm'
    }
  })

  await browser.close()
  return pdfBuffer
}