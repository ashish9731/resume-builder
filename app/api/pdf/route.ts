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
      
      // Use a more robust approach for serverless
      let puppeteerModule;
      let launchOptions: any = {};
      
      if (process.env.NODE_ENV === 'development') {
        // Development: use local puppeteer
        puppeteerModule = (await import('puppeteer')).default;
        launchOptions = {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        };
      } else {
        // Production: use @sparticuz/chromium with proper handling
        const chromiumModule: any = await import('@sparticuz/chromium');
        puppeteerModule = (await import('puppeteer-core')).default;
        
        const executablePath = await chromiumModule.executablePath?.() || await chromiumModule.default?.executablePath?.();
        const args = chromiumModule.args || chromiumModule.default?.args || [];
        const headless = chromiumModule.headless !== undefined ? chromiumModule.headless : (chromiumModule.default?.headless ?? true);
        
        launchOptions = {
          args,
          executablePath,
          headless,
        };
      }

      browser = await puppeteerModule.launch(launchOptions);
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
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
