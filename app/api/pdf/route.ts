import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';

export async function POST(request: NextRequest) {
  try {
    const { html, filename = 'resume.pdf' } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    let browser;
    let pdfBuffer: Buffer;

    try {
      if (process.env.NODE_ENV === 'development') {
        // Use local puppeteer for development
        const localPuppeteer = (await import('puppeteer')).default;
        browser = await localPuppeteer.launch({ headless: true });
      } else {
        // Use serverless-friendly chromium for production
        const executablePath = await chromium.executablePath();
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: executablePath,
          headless: chromium.headless,
        });
      }

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.4in',
          right: '0.4in',
          bottom: '0.4in',
          left: '0.4in'
        }
      });

      await browser.close();
    } catch (error) {
      console.error('PDF generation error:', error);
      return NextResponse.json(
        { error: 'Failed to generate PDF' },
        { status: 500 }
      );
    }

    const response = new NextResponse(pdfBuffer);
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return response;

  } catch (error) {
    console.error('PDF endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF request' },
      { status: 500 }
    );
  }
}
