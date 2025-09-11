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
      // Cache directory setup for fonts and other resources
      const cacheDir = '/tmp/.cache';
      console.log('Using cache directory:', cacheDir);
      
      console.log('Launching browser...');
      if (process.env.NODE_ENV === 'development') {
        // Use local puppeteer for development
        console.log('Using local puppeteer for development');
        const localPuppeteer = (await import('puppeteer')).default;
        browser = await localPuppeteer.launch({ headless: true });
      } else {
        // Use serverless-friendly chromium for production
        console.log('Using serverless chromium for production');
        
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
        }
        
        // Use the standard Chromium executable path from our install script
        const chromiumDir = '/tmp/chromium';
        let executablePath = path.join(chromiumDir, 'chrome');
        
        // Fallback to chromium.executablePath() if our custom path doesn't exist
        if (!fs.existsSync(executablePath)) {
          console.log('Custom Chromium path not found, using chromium.executablePath()');
          executablePath = await chromium.executablePath();
        }
        
        console.log('Using Chromium executable path:', executablePath);
        
        // Verify the executable exists
        if (!fs.existsSync(executablePath)) {
          console.error('Chromium executable not found at:', executablePath);
          
          // Try alternative paths
          const altPaths = [
            '/tmp/chromium/chrome',
            '/tmp/chromium/chromium',
            await chromium.executablePath(),
            '/usr/bin/chromium-browser',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome'
          ];
          
          let foundPath = null;
          for (const altPath of altPaths) {
            if (fs.existsSync(altPath)) {
              foundPath = altPath;
              console.log('Found Chromium at alternative path:', altPath);
              break;
            }
          }
          
          if (!foundPath) {
            throw new Error(`Chromium executable not found. Tried: ${altPaths.join(', ')}`);
          }
          
          executablePath = foundPath;
        }
        
        // Check if file is executable
        try {
          const stats = fs.statSync(executablePath);
          const isExecutable = (stats.mode & parseInt('111', 8)) !== 0;
          console.log('Chromium executable verification:', {
            path: executablePath,
            exists: true,
            isExecutable: isExecutable,
            size: stats.size
          });
          
          if (!isExecutable) {
            console.log('Setting executable permissions...');
            fs.chmodSync(executablePath, 0o755);
          }
        } catch (permError) {
          console.error('Error checking/setting permissions:', permError);
        }
        
        // Load fonts for better text rendering
        try {
          await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
          console.log('Loaded font successfully');
        } catch (fontError) {
          console.error('Error loading font:', fontError);
        }
        
        // Launch browser with comprehensive options
        console.log('Launching browser with executable:', executablePath);
        browser = await puppeteer.launch({
          args: [
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
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-extensions',
            '--disable-default-apps',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
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
