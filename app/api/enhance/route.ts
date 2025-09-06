import { NextResponse } from 'next/server'
import { openai, systemGuardrails } from '@/lib/openai'

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

    const { text, analysis } = await req.json()
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid text parameter' },
        { status: 400 }
      )
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 10,000 characters allowed.' },
        { status: 400 }
      )
    }

    // Validate analysis if provided
    if (analysis && typeof analysis !== 'string') {
      return NextResponse.json(
        { error: 'Analysis must be a string if provided' },
        { status: 400 }
      )
    }

    const prompt = `You are an elite resume writer with 15+ years of experience helping professionals land top-tier positions. Your resumes have helped thousands secure jobs at Fortune 500 companies. Transform this resume into a masterpiece that will make recruiters stop and take notice.

🎯 ENHANCEMENT MISSION: Create a resume that tells a compelling story of professional excellence and value delivery.

📋 ENHANCEMENT FRAMEWORK:

**1. PROFESSIONAL SUMMARY (Power Statement)**
- Write a magnetic 3-4 line summary that immediately communicates value
- Lead with years of experience and core expertise area
- Include 2-3 key achievements or impact statements
- Use industry-specific keywords and power phrases
- Make it impossible to ignore

**2. EXPERIENCE TRANSFORMATION (Achievement Focus)**
- Convert every job description into achievement-focused bullet points
- Start each bullet with powerful action verbs (Spearheaded, Orchestrated, Pioneered, Transformed, Accelerated)
- Add quantifiable impact where logical (increased efficiency by X%, reduced costs by $Y, managed team of Z)
- Include specific technologies, methodologies, and tools used
- Highlight leadership, innovation, and problem-solving examples
- Show progression and growth in responsibilities

**3. SKILLS MASTERY (Strategic Categorization)**
- Group skills into: Technical Expertise, Leadership & Management, Industry Knowledge
- Include trending technologies and in-demand skills
- Add proficiency indicators (Advanced, Expert, Proficient) where appropriate
- Ensure alignment with current job market demands

**4. EDUCATION & CREDENTIALS (Value Enhancement)**
- Enhance education with relevant coursework, projects, or specializations
- Add certifications, training, or professional development
- Include academic achievements, honors, or distinctions
- Show continuous learning and professional growth

**5. PROFESSIONAL PRESENTATION (Visual Excellence)**
- Use clean, professional formatting with clear section headers
- Ensure consistent formatting throughout
- Optimize for both ATS systems and human readers
- Create visual hierarchy that guides the reader's eye

🚫 CRITICAL CONSTRAINTS:
- NEVER fabricate companies, positions, dates, or achievements
- ONLY enhance and expand existing information with logical, professional improvements
- Maintain 100% truthfulness and accuracy
- Use sophisticated, industry-appropriate language
- Create compelling narrative without exaggeration

📊 ANALYSIS INSIGHTS TO APPLY:
${analysis ? analysis.substring(0, 1500) : 'No specific analysis provided - apply general enhancement principles'}

🎯 DELIVERABLE: Return a complete, professionally formatted resume that will make this candidate irresistible to top employers. Focus on impact, value, and professional excellence.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemGuardrails },
        { role: 'user', content: prompt + '\n\nORIGINAL CONTENT:\n' + text.substring(0, 8000) }
      ],
      temperature: 0.1, // Lower temperature for more consistent, professional output
      max_tokens: 3000, // Allow much more detailed enhancement
    })

    const enhanced = completion.choices[0]?.message?.content ?? ''
    
    if (!enhanced) {
      return NextResponse.json(
        { error: 'No enhanced content generated' },
        { status: 500 }
      )
    }

    return NextResponse.json({ enhanced })

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
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}