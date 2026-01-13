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

    const { transcript } = await req.json()
    
    // Validate input
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid transcript parameter' },
        { status: 400 }
      )
    }

    if (transcript.length > 5000) {
      return NextResponse.json(
        { error: 'Transcript too long. Maximum 5,000 characters allowed.' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert communication coach specializing in helping professionals improve their speaking skills for interviews and presentations. Analyze this spoken content and provide a friendly, encouraging assessment.

Focus on these key areas:

🗣️ GRAMMAR & LANGUAGE
Check sentence structure, word choices, and professional language use

🎯 PRONUNCIATION
Evaluate clarity of speech and how easy it is to understand

💭 FILLER WORDS
Notice any "um", "uh", "like", "you know" that interrupt the flow

⏸️ PAUSES & TIMING
Analyze speaking pace, pause placement, and rhythm

✨ SPEAKING QUALITY
Assess confidence, tone, and overall delivery effectiveness

Provide a warm, supportive analysis with:
- Specific examples from the transcript
- Clear improvement suggestions
- Encouraging feedback
- Practical tips for better speaking

Keep the tone conversational and helpful, like a friendly coach giving constructive feedback.

CONTENT TO ANALYZE:
${transcript.substring(0, 4000)}

Return a detailed analysis with emojis and clear, actionable advice.`

    const openai = getOpenAI()
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemGuardrails },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    })

    const analysis = completion.choices[0]?.message?.content ?? ''
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'No analysis generated' },
        { status: 500 }
      )
    }

    return NextResponse.json({ analysis })

  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
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