import { NextResponse } from 'next/server';
// @ts-ignore - react-pdf renderer is CJS/ESM hybrid
import { Document, Page, Text, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

// Serverless-friendly PDF generation with @react-pdf/renderer (no external font/data files required)
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request) {
  console.log('PDF generation API called with @react-pdf/renderer');

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

    // Define styles and PDF structure
    const styles = StyleSheet.create({
      page: {
        fontSize: 11,
        padding: 40,
        fontFamily: 'Helvetica',
        lineHeight: 1.4,
      },
      heading: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
      },
      content: {
        whiteSpace: 'pre-wrap',
      },
    });

    const PdfDocument = (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.heading}>Resume</Text>
          <Text style={styles.content}>{cleanText}</Text>
        </Page>
      </Document>
    );

    // Generate PDF buffer directly
    const pdfBuffer: Buffer = await renderToBuffer(PdfDocument);

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
