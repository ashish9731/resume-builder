import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Create a simple text for testing
    const testText = 'Test resume content for PDF generation';
    
    console.log('Testing PDF generation with text:', testText);
    
    // Test the PDF generation endpoint
    const response = await fetch('http://localhost:3000/api/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: testText }),
    });

    console.log('PDF API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('PDF generation failed:', errorText);
      throw new Error(`PDF generation failed with status: ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type');
    const contentDisposition = response.headers.get('Content-Disposition');
    
    console.log('Response headers:', {
      contentType,
      contentDisposition
    });

    // Try to get a small part of the PDF to verify it's binary data
    const blob = await response.blob();
    const size = blob.size;
    
    return NextResponse.json({
      success: true,
      contentType,
      contentDisposition,
      blobSize: size,
      message: 'PDF generation successful',
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}