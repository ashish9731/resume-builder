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

    const { text, jobDescription } = await req.json()
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid text parameter' },
        { status: 400 }
      )
    }

    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json(
        { error: 'Job description is required for resume analysis' },
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

    const prompt = `You are a senior resume strategist and ATS expert with 20+ years of experience helping professionals secure top-tier positions. Your analysis has helped thousands of candidates land dream jobs at Fortune 500 companies. Conduct a comprehensive, actionable analysis of this resume.

🔍 ANALYSIS MISSION: Identify every opportunity to transform this resume into a powerful career tool that will make recruiters stop and take notice.

📊 COMPREHENSIVE EVALUATION FRAMEWORK:

**1. STRUCTURAL EXCELLENCE**
- Resume format, organization, and visual hierarchy
- Section completeness, flow, and logical progression
- Professional presentation and readability
- Length optimization and content density

**2. CONTENT POWER ASSESSMENT**
- Professional summary impact and value communication
- Work experience depth, achievement focus, and progression
- Quantifiable accomplishments and measurable impact
- Skills positioning, relevance, and market alignment
- Education presentation and credential value

**3. ATS OPTIMIZATION AUDIT**
- Keyword density, relevance, and strategic placement
- Industry-specific terminology and technical language
- Skills visibility and trending technology inclusion
- Action verb variety and power language usage
- Format compatibility and parsing optimization

**4. COMPETITIVE ADVANTAGE ANALYSIS**
- Unique selling propositions and differentiation factors
- Leadership examples and initiative demonstrations
- Problem-solving capabilities and innovation showcases
- Market positioning and value proposition clarity
- Career progression and growth trajectory

**5. TRANSFORMATION ROADMAP**
- Specific content enhancement opportunities
- Formatting improvements and visual enhancements
- Missing elements and gap identification
- Industry best practices and market standards alignment
- Strategic recommendations for maximum impact

🎯 DELIVERABLE: Provide a detailed, actionable analysis with specific examples from the resume. Focus on concrete improvements that will elevate this resume from good to exceptional. Include specific recommendations for each section that will make this candidate irresistible to top employers.

${jobDescription ? `
🎯 TARGET ROLE CONTEXT:
${jobDescription.substring(0, 2000)}

IMPORTANT: Prioritize analysis and recommendations that align the resume with this specific job description. Focus on matching required skills, qualifications, and experience mentioned in the job posting.` : ''}`

    const openai = getOpenAI()
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemGuardrails },
        { role: 'user', content: prompt + '\n\nCONTENT:\n' + text.substring(0, 8000) } // Limit input length
      ],
      temperature: 0.1, // Lower temperature for more consistent analysis
      max_tokens: 2000, // Allow much more detailed analysis
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