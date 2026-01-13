import { NextResponse } from 'next/server'
import { getOpenAI, systemGuardrails } from '@/lib/openai'

export const runtime = 'nodejs'
export const maxDuration = 30

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

    const contentType = req.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Request must be JSON' },
        { status: 400 }
      )
    }

    const { text, analysis, jobDescription } = await req.json()
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid text parameter' },
        { status: 400 }
      )
    }

    // Make job description optional but provide default
    const jobDesc = jobDescription || 'General professional position requiring relevant skills and experience';
    
    if (typeof jobDesc !== 'string') {
      return NextResponse.json(
        { error: 'Job description must be a string' },
        { status: 400 }
      )
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 10,000 characters allowed.' },
        { status: 400 }
      )
    }

    if (jobDescription.length > 5000) {
      return NextResponse.json(
        { error: 'Job description too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      )
    }

    const prompt = `Enhance this resume to better match the job description while preserving all original information.

ORIGINAL RESUME:
${text}

JOB DESCRIPTION:
${jobDesc}

ANALYSIS FEEDBACK:
${analysis}

Instructions:
1. Keep the exact same structure and section headers as the original
2. Improve content to better align with the job description
3. Use stronger action verbs and quantify achievements where possible
4. Add relevant keywords from the job description
5. Maintain all factual information - do not invent anything
6. Keep professional, concise language

Return only the enhanced resume text in the same format as the original.`

    const openai = getOpenAI()
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemGuardrails },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    })

    let enhanced = completion.choices[0]?.message?.content ?? ''
    
    if (!enhanced) {
      return NextResponse.json(
        { error: 'No enhanced content generated' },
        { status: 500 }
      )
    }

    // Clean up any remaining formatting artifacts while preserving structure
    enhanced = enhanced
      .replace(/^#+\s*/gm, '') // Remove # headers
      .replace(/\*\*/g, '') // Remove ** bold markers
      .replace(/^\d+\.\s*/gm, '') // Remove numbered lists
      .replace(/^[-*]\s*/gm, '• ') // Convert to clean bullets
      .replace(/\|/g, ' | ') // Normalize pipe separators
      .replace(/\s+$/gm, '') // Remove trailing whitespace
      .trim()

    return NextResponse.json({ enhanced })

  } catch (error: any) {
    console.error('Resume enhancement error:', {
      message: error?.message,
      status: error?.status,
      name: error?.name
    })
    
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
      { 
        error: error?.message || 'Failed to enhance resume. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}