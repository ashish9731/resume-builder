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

    const prompt = `You are an expert communication coach and professional speech analyst with decades of experience helping candidates excel in interviews and presentations. Your analysis has helped thousands of professionals land their dream jobs. Conduct a comprehensive analysis of this spoken content.

ANALYSIS FRAMEWORK:

**1. CLARITY ASSESSMENT**
- Articulation and pronunciation evaluation
- Sentence structure and grammatical accuracy
- Word choice appropriateness and professionalism
- Elimination of filler words (um, uh, like, you know)
- Overall message coherence and understandability

**2. PACING ANALYSIS**
- Speaking rate (too fast/slow/just right)
- Pause usage and strategic silence placement
- Rhythm and flow of delivery
- Breath control and natural inflection points
- Timing effectiveness for emphasis and comprehension

**3. CONFIDENCE INDICATORS**
- Tone strength and vocal projection assessment
- Authority and conviction in delivery
- Self-assurance indicators vs. uncertainty signals
- Body language implications from vocal cues
- Professional presence demonstration

**4. CONTENT QUALITY**
- Relevance to stated purpose/objective
- Logical flow and organizational structure
- Key point emphasis and supporting details
- Achievement and skill highlighting effectiveness
- Storytelling capability and engagement level

**5. IMPROVEMENT ROADMAP**
- Specific techniques for immediate improvement
- Long-term development strategies
- Practice exercises and drills
- Professional resources and tools
- Measurable goals and progress tracking

DELIVERABLE: Provide a detailed, actionable analysis with specific examples from the transcript. Focus on concrete improvements that will elevate this speaker's communication from competent to exceptional. Include specific recommendations for each area that will make this candidate irresistible to interviewers and hiring managers.

CONTENT TO ANALYZE:
${transcript.substring(0, 4000)}

Return a comprehensive analysis focusing on the areas above, with specific examples and actionable recommendations.`

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