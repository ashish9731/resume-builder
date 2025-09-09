import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
// Use puppeteer-core for serverless environments
import puppeteer from 'puppeteer-core';

// These settings are important for Vercel deployment
export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel Hobby max is 60s

export async function POST(request: Request) {
  console.log('PDF generation API called');
  
  try {
    // Parse the request body - handle both JSON and form data
    let text = '';
    const contentType = request.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        // Handle JSON request
        console.log('Processing JSON request');
        const body = await request.json();
        text = body.text;
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        // Handle form data
        console.log('Processing form data request');
        const formData = await request.formData();
        text = formData.get('text') as string;
      } else {
        // Try JSON as fallback
        console.log('Unknown content type, trying JSON as fallback');
        try {
          const body = await request.json();
          text = body.text;
        } catch (e) {
          console.error('Failed to parse as JSON:', e);
        }
      }
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!text) {
      console.error('No text provided in request');
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    console.log('Received text length:', text.length);

    // Clean the text and remove all formatting characters and branding
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\n\n\n+/g, '\n\n')
      .trim();

    // Create clean, professional HTML for the PDF
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
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              line-height: 1.4; 
              color: #000; 
              background: white; 
              font-size: 11pt; 
            }
            /* Use pre-wrap to preserve whitespace and newlines from the input text */
            .resume-content { 
              white-space: pre-wrap; 
              word-wrap: break-word;
            }
            @media print { 
              body { 
                margin: 0; 
              } 
            }
          </style>
        </head>
        <body>
          <div class="resume-content">${cleanText}</div>
        </body>
      </html>
    `;

    let browser = null;
    let pdfBuffer: Buffer;

    try {
      console.log('Launching browser...');
      if (process.env.NODE_ENV === 'development') {
        // Use local puppeteer for development
        console.log('Using local puppeteer for development');
        const localPuppeteer = (await import('puppeteer')).default;
        browser = await localPuppeteer.launch({ headless: true });
      } else {
        // Use serverless-friendly chromium for production
        console.log('Using serverless chromium for production');
        const executablePath = await chromium.executablePath();
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            headless: chromium.headless,
        });
      }

      console.log('Browser launched successfully');
      const page = await browser.newPage();
      console.log('New page created');
      
      // Set content and wait for it to be fully loaded
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
      });
      console.log('Page content set');
      
      // page.pdf() returns a Uint8Array, which we need to convert to a Buffer
      console.log('Generating PDF...');
      const pdfUint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in',
        },
      });
      pdfBuffer = Buffer.from(pdfUint8Array);
      console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr);
      return NextResponse.json({ error: 'PDF generation failed', details: String(pdfErr) }, { status: 500 });
    } finally {
        if (browser !== null) {
            await browser.close();
            console.log('Browser closed');
        }
    }

    // Create a Blob from the PDF buffer and use it as the response body.
    console.log('Creating response with PDF data');
    // Convert Buffer to Uint8Array which is compatible with BlobPart
    const pdfUint8Array = new Uint8Array(pdfBuffer);
    const pdfBlob = new Blob([pdfUint8Array], { type: 'application/pdf' });
    
    // Create the response with appropriate headers
    const response = new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Content-Length': String(pdfBuffer.length),
        // Add cache control headers to prevent caching issues
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
    console.log('Response created successfully with headers:', response.headers);
    return response;

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to process request', details: String(error) }, { status: 500 });
  }
}
