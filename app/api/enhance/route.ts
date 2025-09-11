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

    const prompt = `You are an expert professional resume writer. Create a clean, ATS-optimized resume following this exact format. Return ONLY the resume content with no formatting markers, no section numbers, no asterisks, no hashtags, no bullet numbers - just clean professional text.

RESUME FORMAT:

[Full Name]
[Phone Number] | [Email] | [LinkedIn Profile]
[City, State]

PROFESSIONAL SUMMARY
[Write 3-4 compelling sentences about years of experience, core expertise, and key achievements with specific metrics]

CORE COMPETENCIES
[Technical Skills: List relevant technical skills separated by commas]
[Leadership Skills: List management and leadership skills separated by commas]
[Industry Knowledge: List domain expertise separated by commas]

PROFESSIONAL EXPERIENCE

[Job Title]
[Company Name] | [Location] | [Month Year - Month Year]
• [Action verb] [achievement/task] resulting in [specific metric/result]
• [Action verb] [achievement/task] leading to [specific metric/result]
• [Action verb] [achievement/task] improving [specific metric/result]

[Next Job Title]
[Next Company Name] | [Location] | [Month Year - Month Year]
• [Action verb] [achievement/task] resulting in [specific metric/result]
• [Action verb] [achievement/task] leading to [specific metric/result]
• [Action verb] [achievement/task] improving [specific metric/result]

EDUCATION
[Degree] in [Major]
[University Name] | [Graduation Year]

CERTIFICATIONS
• [Certification Name] - [Issuing Organization] - [Year]
• [Certification Name] - [Issuing Organization] - [Year]

PROJECTS
[Project Name] - [Technologies Used]
• [Brief description with quantified impact]

[Next Project Name] - [Technologies Used]
• [Brief description with quantified impact]

GUIDELINES:
- Use actual bullet points (•) not numbers or dashes
- Include specific metrics, percentages, and dollar amounts
- Use powerful action verbs: Spearheaded, Orchestrated, Pioneered, Transformed, Accelerated, Optimized, Streamlined, Implemented, Led, Managed, Developed, Designed, Analyzed, Delivered
- Ensure all content is factual and professional
- Write in clean, readable paragraphs with proper spacing
- Focus on achievements and business impact
- Include relevant keywords naturally throughout

TRANSFORM THIS RESUME:
${text}

${analysis ? `\nADDITIONAL CONTEXT: ${analysis.substring(0, 800)}` : ''}

Return only the clean, formatted resume content with no section labels, no formatting instructions, no asterisks, no hashtags, and no numbering - just the professional resume text.`

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

    // Clean up any remaining formatting artifacts
    enhanced = enhanced
      .replace(/^#+\s*/gm, '') // Remove # headers
      .replace(/\*\*/g, '') // Remove ** bold markers
      .replace(/^\d+\.\s*/gm, '') // Remove numbered lists
      .replace(/^[-*]\s*/gm, '• ') // Convert to clean bullets
      .replace(/\|/g, ' | ') // Normalize pipe separators
      .replace(/\n{3,}/g, '\n\n') // Normalize spacing
      .replace(/\s+$/gm, '') // Remove trailing whitespace
      .trim()

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