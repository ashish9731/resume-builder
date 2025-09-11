import { NextResponse } from 'next/server';

// Pure serverless PDF generation with no external dependencies
export const runtime = 'nodejs';
export const maxDuration = 30;

// Simple PDF generation using raw PDF commands
function createSimplePDF(text: string): Buffer {
  const lines = text.split('\n').filter(line => line.trim());
  const fontSize = 12;
  const lineHeight = fontSize * 1.2;
  const margin = 40;
  const pageWidth = 595; // A4 width
  const pageHeight = 842; // A4 height
  const contentWidth = pageWidth - (2 * margin);
  
  let content = '';
  let y = margin + lineHeight;
  
  // PDF header
  content += `%PDF-1.4\n`;
  content += `1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n`;
  content += `2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n`;
  
  // Page content
  let pageContent = `BT\n/F1 ${fontSize} Tf\n`;
  
  lines.forEach(line => {
    if (y + lineHeight > pageHeight - margin) return; // Skip if too low
    pageContent += `${margin} ${pageHeight - y} Td\n(${escapePDFString(line)}) Tj\n`;
    y += lineHeight;
  });
  pageContent += `ET\n`;
  
  const contentLength = pageContent.length;
  
  content += `3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 ${pageWidth} ${pageHeight}]\n/Contents 4 0 R\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n>>\nendobj\n`;
  content += `4 0 obj\n<<\n/Length ${contentLength}\n>>\nstream\n${pageContent}endstream\nendobj\n`;
  
  // Cross-reference table
  const xrefOffset = content.length;
  content += `xref\n0 5\n0000000000 65535 f\n`;
  content += `0000000010 00000 n\n`;
  content += `0000000075 00000 n\n`;
  content += `0000000150 00000 n\n`;
  content += `0000000300 00000 n\n`;
  
  // Trailer
  content += `trailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n${xrefOffset}\n%%EOF`;
  
  return Buffer.from(content, 'binary');
}

function escapePDFString(str: string): string {
  return str.replace(/[()\\]/g, '\\$&');
}

export async function POST(request: Request) {
  console.log('PDF generation API called with pure serverless implementation');

  try {
    let text = '';
    const contentType = request.headers.get('content-type') || '';

    try {
      if (contentType.includes('application/json')) {
        const body = await request.json();
        text = body.text || body.content || '';
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        text = (formData.get('text') as string) || (formData.get('content') as string) || '';
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
    
    // Generate PDF buffer directly
    const pdfBuffer = createSimplePDF(cleanText);

    console.log('PDF generated successfully (size:', pdfBuffer.length, 'bytes)');

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
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
