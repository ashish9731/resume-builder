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

    const prompt = `You are an expert ATS (Applicant Tracking System) resume writer. Transform this resume into an ATS-optimized masterpiece that will pass through ATS filters and impress recruiters. Follow this exact structure and formatting:

## ATS-OPTIMIZED RESUME STRUCTURE

### 1. HEADER (Required)
Format exactly as:
[FULL NAME]
[PHONE NUMBER] | [PROFESSIONAL EMAIL] | [LINKEDIN PROFILE]
[CITY, STATE]

### 2. PROFESSIONAL SUMMARY (3-4 sentences)
Write a compelling summary that includes:
- Years of experience and core expertise
- 2-3 key achievements with metrics
- Keywords from job descriptions
- Value proposition statement

### 3. CORE SKILLS / KEY COMPETENCIES
Format as comma-separated list:
Technical Skills: [List 8-12 technical skills relevant to target role]
Leadership Skills: [List 4-6 leadership/management skills]
Industry Knowledge: [List 3-5 domain-specific skills]

### 4. PROFESSIONAL EXPERIENCE (Reverse chronological)
For each role, format as:
[JOB TITLE] | [COMPANY NAME] | [LOCATION] | [MM/YYYY - MM/YYYY]
• [Action verb] [achievement/task] resulting in [quantified result]
• [Action verb] [achievement/task] leading to [quantified result]
• [Action verb] [achievement/task] improving [quantified result]

Use these action verbs: Spearheaded, Orchestrated, Pioneered, Transformed, Accelerated, Optimized, Streamlined, Implemented, Led, Managed, Developed, Designed, Analyzed, Delivered, Achieved

### 5. EDUCATION
[DEGREE] in [MAJOR] | [UNIVERSITY NAME] | [GRADUATION YEAR]
[GPA if 3.5+] | [Relevant coursework/projects if applicable]

### 6. CERTIFICATIONS & TRAINING
• [Certification Name] - [Issuing Organization] - [Year]
• [Training Program] - [Provider] - [Year]

### 7. PROJECTS (Optional but ATS-friendly)
[Project Name] | [Technologies Used]
• [Brief description with quantified impact]

## FORMATTING RULES
- Use simple text format (no tables, graphics, or columns)
- Stick to standard fonts (use plain text)
- Use bullet points (•) for clarity
- Ensure consistent spacing between sections
- Match keywords from job descriptions exactly
- Include specific technologies, tools, and methodologies
- Add quantifiable metrics wherever possible

## ENHANCEMENT GUIDELINES
- Convert job descriptions into achievement-focused statements
- Add specific numbers, percentages, and dollar amounts
- Include relevant keywords for ATS optimization
- Highlight progression and increased responsibilities
- Emphasize business impact and value delivery

## STRICT CONSTRAINTS
- NEVER fabricate companies, positions, or achievements
- ONLY enhance existing information with logical improvements
- Maintain 100% factual accuracy
- Use sophisticated, professional language
- Create compelling narrative without exaggeration

TRANSFORM THIS RESUME:
${text}

${analysis ? `\nANALYSIS INSIGHTS: ${analysis.substring(0, 1000)}` : ''}

Return only the ATS-optimized resume content, properly formatted with all sections included.`

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
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}