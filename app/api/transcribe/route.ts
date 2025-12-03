import { NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'
import { Readable } from 'stream'
import fs from 'fs'
import path from 'path'
import os from 'os'

export const runtime = 'nodejs'
export const maxDuration = 60

// Helper function to convert Web Stream to Node.js Readable Stream
async function webStreamToNodeReadable(webStream: ReadableStream) {
  const reader = webStream.getReader()
  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read()
        if (done) {
          this.push(null)
        } else {
          this.push(Buffer.from(value))
        }
      } catch (error) {
        this.destroy(error as Error)
      }
    }
  })
}

export async function POST(req: Request) {
  try {
    // Validate request
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const contentType = req.headers.get('content-type') || ''
    
    // Handle multipart form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      
      if (!file) {
        return NextResponse.json(
          { error: 'No audio file provided' },
          { status: 400 }
        )
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Validate file size (OpenAI limit is 25MB)
      if (buffer.length > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 25MB.' },
          { status: 400 }
        )
      }

      // Create temporary file
      const tempDir = os.tmpdir()
      const tempFilePath = path.join(tempDir, `audio-${Date.now()}-${file.name}`)
      
      try {
        // Write buffer to temporary file
        await fs.promises.writeFile(tempFilePath, buffer)
        
        // Transcribe audio using OpenAI Whisper
        const openai = getOpenAI()
        
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: 'whisper-1',
          response_format: 'text'
        })

        // Clean up temporary file
        await fs.promises.unlink(tempFilePath).catch(() => {})

        return NextResponse.json({ transcript: transcription })
      } catch (error) {
        // Clean up temporary file even if transcription fails
        await fs.promises.unlink(tempFilePath).catch(() => {})
        throw error
      }
    } 
    // Handle binary audio data
    else {
      // Convert Web Stream to Node.js Readable Stream
      const nodeStream = await webStreamToNodeReadable(req.body as ReadableStream)
      
      // Create temporary file
      const tempDir = os.tmpdir()
      const tempFilePath = path.join(tempDir, `audio-${Date.now()}.webm`)
      
      try {
        // Write stream to temporary file
        const writeStream = fs.createWriteStream(tempFilePath)
        nodeStream.pipe(writeStream)
        
        // Wait for stream to finish
        await new Promise<void>((resolve, reject) => {
          writeStream.on('finish', () => resolve())
          writeStream.on('error', reject)
        })
        
        // Get file size
        const stats = await fs.promises.stat(tempFilePath)
        if (stats.size > 25 * 1024 * 1024) {
          await fs.promises.unlink(tempFilePath).catch(() => {})
          return NextResponse.json(
            { error: 'Audio data too large. Maximum size is 25MB.' },
            { status: 400 }
          )
        }
        
        // Transcribe audio using OpenAI Whisper
        const openai = getOpenAI()
        
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: 'whisper-1',
          response_format: 'text'
        })

        // Clean up temporary file
        await fs.promises.unlink(tempFilePath).catch(() => {})

        return NextResponse.json({ transcript: transcription })
      } catch (error) {
        // Clean up temporary file even if transcription fails
        await fs.promises.unlink(tempFilePath).catch(() => {})
        throw error
      }
    }
  } catch (error: any) {
    console.error('Audio transcription error:', error)
    
    // Handle specific OpenAI errors
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Authentication error. Please check API configuration.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}