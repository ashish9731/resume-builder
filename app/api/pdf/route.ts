import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  console.log('PDF generation API called');
  
  try {
    // Parse request body
    const contentType = request.headers.get('content-type') || '';
    let text = '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      text = body.text || body.html || '';
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      text = formData.get('text') as string || formData.get('html') as string || '';
    } else {
      try {
        const body = await request.json();
        text = body.text || body.html || '';
      } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      }
    }

    if (!text) {
      return NextResponse.json({ error: 'No text or HTML content provided' }, { status: 400 });
    }

    console.log('Received content length:', text.length);

    // Create clean HTML for PDF
    const htmlContent = text.includes('<!DOCTYPE html>') ? text : `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume</title>
          <style>
            @page { margin: 0.75in; size: A4; }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              line-height: 1.4; 
              color: #000; 
              font-size: 11pt; 
              margin: 0;
              padding: 0;
            }
            .resume-content { 
              white-space: pre-wrap; 
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <div class="resume-content">${text}</div>
        </body>
      </html>
    `;

    let browser = null;
    let pdfBuffer: Buffer;

    try {
      if (process.env.NODE_ENV === 'development') {
        // Use full puppeteer for development
        const localPuppeteer = await import('puppeteer');
        browser = await localPuppeteer.default.launch({ 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      } else {
        // Use serverless chromium for production
        const executablePath = await chromium.executablePath();
        
        browser = await puppeteer.launch({
          args: [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ],
          defaultViewport: chromium.defaultViewport,
          executablePath,
          headless: true
        });
      }

      const page = await browser.newPage();
      
      // Set content with proper waiting
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });

      // Generate PDF
      const pdfData = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in'
        }
      });

      pdfBuffer = Buffer.from(pdfData);

    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr);
      return NextResponse.json({ 
        error: 'PDF generation failed', 
        details: String(pdfErr) 
      }, { status: 500 });
    } finally {
      if (browser) {
        await browser.close().catch(console.error);
      }
    }

    // Return the PDF directly as a buffer
    const response = new NextResponse(pdfBuffer);
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', 'attachment; filename="resume.pdf"');
    response.headers.set('Content-Length', pdfBuffer.length.toString());
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return response;

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request', 
      details: String(error) 
    }, { status: 500 });
  }
}
