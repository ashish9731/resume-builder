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
        
        // Configure chromium for Vercel serverless environment
        console.log('Setting up chromium for serverless environment');
        
        // Set chromium to use /tmp directory for cache
        const cacheDir = process.env.PUPPETEER_CACHE_DIR || '/tmp/puppeteer-cache';
        process.env.PUPPETEER_CACHE_DIR = cacheDir;
        console.log('Using cache directory:', cacheDir);
        
        // Ensure the cache directory exists
        try {
          if (!fs.existsSync(cacheDir)) {
            console.log(`Creating cache directory: ${cacheDir}`);
            fs.mkdirSync(cacheDir, { recursive: true });
          }
        } catch (dirError) {
          console.error('Error creating cache directory:', dirError);
          // Continue anyway, the directory might be created by another process
        }
        
        // Create additional directories that might be needed
        const additionalDirs = [
          '/tmp/chromium',
          '/var/task/.next/server/app/api/bin'
        ];
        
        for (const dir of additionalDirs) {
          try {
            if (!fs.existsSync(dir)) {
              console.log(`Creating additional directory: ${dir}`);
              fs.mkdirSync(dir, { recursive: true });
            }
          } catch (dirError) {
            console.error(`Error creating directory ${dir}:`, dirError);
            // Continue anyway, not all directories may be creatable
          }
        }
        
        // Load fonts for better text rendering
        try {
          await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
          console.log('Loaded font successfully');
        } catch (fontError) {
          console.error('Error loading font:', fontError);
          // Continue anyway, font loading is not critical
        }
        
        // Get the executable path with proper error handling
        let executablePath;
        const possiblePaths = [
          // Try environment variable first
          process.env.CHROME_EXECUTABLE_PATH,
          // Then try the standard chromium path
          await chromium.executablePath().catch(() => null),
          // Then try common fallback paths
          '/tmp/chromium/chromium',
          '/tmp/chromium/chrome',
          '/var/task/node_modules/@sparticuz/chromium/bin',
          '/var/task/.next/server/app/api/bin/chromium'
        ].filter(Boolean); // Remove null/undefined values
        
        console.log('Checking possible Chrome executable paths:', possiblePaths);
        
        // Find the first path that exists
        for (const path of possiblePaths) {
          try {
            if (path && fs.existsSync(path)) {
              executablePath = path;
              console.log('Found Chrome executable at:', executablePath);
              break;
            }
          } catch (checkError) {
            console.error(`Error checking path ${path}:`, checkError);
          }
        }
        
        if (!executablePath) {
          console.error('No valid Chrome executable path found, using default');
          // Use the default path as last resort
          executablePath = await chromium.executablePath().catch(err => {
            console.error('Error getting default path:', err);
            return '/tmp/chromium/chrome'; // Absolute last resort
          });
        }
        
        // Launch browser with comprehensive options
        console.log('Launching browser with executablePath:', executablePath);
        browser = await puppeteer.launch({
          args: [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--font-render-hinting=none',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
          ],
          defaultViewport: chromium.defaultViewport,
          executablePath: executablePath,
          headless: true
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
            try {
                await browser.close();
                console.log('Browser closed');
            } catch (closeError) {
                console.error('Error closing browser:', closeError);
                // Continue anyway, browser might already be closed
            }
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
