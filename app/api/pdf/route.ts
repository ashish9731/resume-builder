import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
// Use puppeteer-core for serverless environments
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

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
    let pdfData: Uint8Array;

    try {
      console.log('Launching browser...');
      
      // Check if we're in development
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        // Use local puppeteer for development
        console.log('Using local puppeteer for development');
        const localPuppeteer = (await import('puppeteer')).default;
        browser = await localPuppeteer.launch({ headless: true });
      } else {
        // Use serverless-friendly chromium for production
        console.log('Using serverless chromium for production');
        
        // Get the executable path from chromium
        let executablePath: string;
        try {
          executablePath = await chromium.executablePath();
          console.log('Chromium executable path from package:', executablePath);
        } catch (chromiumError) {
          console.error('Error getting chromium executable path:', chromiumError);
          // Fallback to hardcoded path
          executablePath = '/tmp/chromium/chrome';
        }
        
        // Ensure executable exists
        if (!fs.existsSync(executablePath)) {
          console.log('Executable not found at:', executablePath);
          
          // Try common serverless paths
          const serverlessPaths = [
            '/tmp/chromium/chrome',
            '/tmp/chromium/chromium',
            '/opt/chromium/chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome'
          ];
          
          for (const testPath of serverlessPaths) {
            if (fs.existsSync(testPath)) {
              executablePath = testPath;
              console.log('Found executable at:', testPath);
              break;
            }
          }
          
          if (!fs.existsSync(executablePath)) {
            throw new Error(`Chromium executable not found. Tried: ${serverlessPaths.join(', ')} and ${executablePath}`);
          }
        }
        
        // Set up cache directory
        const cacheDir = '/tmp/puppeteer-cache';
        process.env.PUPPETEER_CACHE_DIR = cacheDir;
        
        // Ensure cache directory exists
        try {
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
          }
        } catch (dirError) {
          console.warn('Could not create cache directory:', dirError);
        }
        
        // Launch browser with minimal args for serverless
        console.log('Launching browser with executable:', executablePath);
        browser = await puppeteer.launch({
          args: chromium.args.concat([
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--single-process',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]),
          executablePath: executablePath,
          headless: true,
        });
      }

      console.log('Browser launched successfully');
      const page = await browser.newPage();
      console.log('New page created');
      
      // Set content and wait for it to be fully loaded
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
      });
      
      // Generate PDF
      console.log('Generating PDF...');
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
      
    } catch (browserError) {
      console.error('Browser/PDF generation error:', browserError);
      throw browserError;
    } finally {
      if (browser) {
        console.log('Closing browser...');
        await browser.close();
      }
    }

    // Return the PDF
    console.log('Returning PDF response...');
    return new NextResponse(pdfData as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Content-Length': pdfData.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        CHROME_EXECUTABLE_PATH: process.env.CHROME_EXECUTABLE_PATH,
        PUPPETEER_CACHE_DIR: process.env.PUPPETEER_CACHE_DIR
      }
    });
    
    return NextResponse.json(
      { 
        error: 'PDF generation failed', 
        details: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? {
          stack: errorStack,
          executablePath: process.env.CHROME_EXECUTABLE_PATH
        } : undefined
      },
      { status: 500 }
    );
  }
}
