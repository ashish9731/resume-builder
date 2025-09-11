import { NextResponse } from 'next/server';

// These settings are important for Vercel deployment
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  console.log('PDF generation API called');
  
  try {
    let text = '';
    const contentType = request.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        const body = await request.json();
        text = body.text;
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        text = formData.get('text') as string;
      } else {
        const body = await request.json();
        text = body.text;
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const cleanText = text.replace(/\*\*/g, '').replace(/\n\n\n+/g, '\n\n').trim();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume</title>
          <style>
            @page { margin: 0.75in; size: A4; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              line-height: 1.4; 
              color: #000; 
              background: white; 
              font-size: 11pt; 
            }
            .resume-content { 
              white-space: pre-wrap; 
              word-wrap: break-word;
            }
            @media print { 
              body { margin: 0; } 
            }
          </style>
        </head>
        <body>
          <div class="resume-content">${cleanText}</div>
        </body>
      </html>
    `;

    let browser = null;
    let pdfData: Uint8Array;

    try {
      console.log('Launching browser for PDF generation...');
      
      // Simplified approach using only puppeteer-core for both dev and prod
      let puppeteer;
      let launchOptions: any = {};
      
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        // Production: Use @sparticuz/chromium with puppeteer-core
        console.log('Using serverless Chromium with puppeteer-core');
        
        const chromium = require('@sparticuz/chromium');
        puppeteer = require('puppeteer-core');
        
        launchOptions = {
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        };
      } else {
        // Development: Use local puppeteer
        console.log('Using local puppeteer for development');
        puppeteer = require('puppeteer');
        
        launchOptions = {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        };
      }

      browser = await puppeteer.launch(launchOptions);
      console.log('Browser launched successfully');
      
      const page = await browser.newPage();
      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
      });
      
      pdfData = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in',
        },
      });
      
      console.log('PDF generated successfully, size:', pdfData.length);
      
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return new NextResponse(pdfData as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Content-Length': pdfData.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'PDF generation failed', 
        details: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? {
          env: process.env.NODE_ENV,
          vercel: process.env.VERCEL
        } : undefined
      },
      { status: 500 }
    );
  }
}
