import { NextResponse } from 'next/server'
import mammoth from 'mammoth'
import pdf from 'pdf-parse'
import { TextDecoder } from 'util'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_FILE_SIZE = 5 * 1024 * 1024
const SUPPORTED_EXTENSIONS = ['.txt', '.pdf', '.docx']
const SUPPORTED_MIME_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

// Try multiple encodings for text files
const tryDecodeBuffer = (buffer: Buffer): string => {
  const encodings = ['utf8', 'latin1', 'utf16le', 'win1252']
  
  for (const encoding of encodings) {
    try {
      return new TextDecoder(encoding).decode(buffer)
    } catch {
      continue
    }
  }
  
  // Fallback to utf8 with replacement characters
  return buffer.toString('utf8')
}

export async function POST(req: Request) {
  try {
    // Check content type
    const contentType = req.headers.get('content-type')
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    const fileName = file.name.toLowerCase()
    const fileType = file.type

    // Validate file type
    const isValidExtension = SUPPORTED_EXTENSIONS.some(ext => fileName.endsWith(ext))
    const isValidMimeType = fileType === '' || SUPPORTED_MIME_TYPES.includes(fileType) // Some browsers may not send MIME type

    if (!isValidExtension || !isValidMimeType) {
      return NextResponse.json(
        { 
          error: 'Unsupported file format',
          supportedFormats: SUPPORTED_EXTENSIONS.join(', '),
          details: `Uploaded file: ${fileName} (${fileType})`
        },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''

    try {
      if (fileName.endsWith('.txt')) {
        text = tryDecodeBuffer(buffer)
      } else if (fileName.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer })
        text = result.value
      } else if (fileName.endsWith('.pdf')) {
        const data = await pdf(buffer)
        text = data.text
      }

      // Clean up text
      text = text.replace(/\s+/g, ' ').trim()

      if (!text || text.length === 0) {
        return NextResponse.json(
          { error: 'No text content could be extracted from the file' },
          { status: 400 }
        )
      }

      // Limit extracted text size
      const MAX_TEXT_LENGTH = 100000
      if (text.length > MAX_TEXT_LENGTH) {
        text = text.substring(0, MAX_TEXT_LENGTH) + '... [content truncated]'
      }

      return NextResponse.json({ 
        text,
        fileName: file.name,
        fileSize: file.size,
        characterCount: text.length
      })

    } catch (processingError: any) {
      console.error('File processing error:', processingError)
      return NextResponse.json(
        { error: 'Failed to process file. The file may be corrupted, encrypted, or password protected.' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}