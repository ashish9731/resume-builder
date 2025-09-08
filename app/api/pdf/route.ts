import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
// Use puppeteer-core for serverless environments
import puppeteer from 'puppeteer-core';

// You can remove the local 'puppeteer' import if you are only deploying to serverless
// import localPuppeteer from 'puppeteer';

// These settings are important for Vercel deployment
export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel Hobby max is 60s

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

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
        // Path to chromium executable for serverless environments
        const executablePath = await chromium.executablePath();
        
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            headless: chromium.headless,
        });

      const page = await browser.newPage();
      
      // Set content and wait for it to be fully loaded
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
      });
      
      // page.pdf() returns a Uint8Array, which we need to convert to a Buffer
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

    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr);
      return NextResponse.json({ error: 'PDF generation failed', details: String(pdfErr) }, { status: 500 });
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }

    // --- SOLUTION ---
    // The Buffer type is not directly assignable to BodyInit in this context.
    // Convert the Buffer to an ArrayBuffer using its .buffer property.
    return new NextResponse(pdfBuffer.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to process request', details: String(error) }, { status: 500 });
  }
}
