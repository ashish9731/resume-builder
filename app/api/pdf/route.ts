import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

// Pure JavaScript solution - no binaries needed
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request) {
  console.log('PDF generation API called with pure JS solution');
  
  try {
    let text = '';
    const contentType = request.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        const body = await request.json();
        text = body.text || body.content || '';
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        text = formData.get('text') as string || formData.get('content') as string || '';
      } else {
        const body = await request.json();
        text = body.text || body.content || '';
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const cleanText = text.replace(/\*\*/g, '').replace(/\n\n\n+/g, '\n\n').trim();

    // Create PDF using pure JavaScript - no binaries needed
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 72,
        bottom: 72,
        left: 72,
        right: 72
      }
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // Add content to PDF
    doc.fontSize(16).text('Resume', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(cleanText, {
      align: 'left',
      lineGap: 2
    });

    doc.end();

    const pdfBuffer = await pdfPromise;
    
    console.log('PDF generated successfully with pure JS, size:', pdfBuffer.length);

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { 
        error: 'PDF generation failed', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
