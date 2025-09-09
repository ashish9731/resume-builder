import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { text, html } = await request.json();
    const content = html || text;

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    let browser;
    if (process.env.NODE_ENV === 'development') {
      const localPuppeteer = await import('puppeteer');
      browser = await localPuppeteer.default.launch({ headless: true });
    } else {
      const executablePath = await chromium.executablePath();
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath,
        headless: true
      });
    }

    const page = await browser.newPage();
    await page.setContent(content, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' }
    });

    await browser.close();

    // Return as ArrayBuffer
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Content-Length': pdf.length.toString()
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: String(error) },
      { status: 500 }
    );
  }
}
