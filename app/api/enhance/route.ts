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

    const prompt = `You are an expert professional resume writer specializing in ATS optimization. Create a clean, professionally formatted resume that strategically aligns with the target job description while preserving all factual information from the original resume.

CRITICAL INSTRUCTIONS:
1. MAINTAIN ALL FACTUAL INFORMATION from the original resume
2. STRATEGICALLY ENHANCE the content to match the job description
3. PRESERVE the candidate's actual experience and achievements
4. OPTIMIZE for ATS systems by including relevant keywords
5. QUANTIFY achievements with specific metrics where possible
6. USE powerful action verbs to describe responsibilities
7. ALIGN skills and experiences with job requirements

RESUME FORMAT:

[Full Name]
[Phone Number] | [Email] | [LinkedIn Profile]
[City, State]

PROFESSIONAL SUMMARY
[Write 3-4 compelling sentences about years of experience, core expertise, and key achievements with specific metrics. Tailor this section to highlight experience most relevant to the job description.]

CORE COMPETENCIES
[Technical Skills: List relevant technical skills separated by commas - prioritize skills mentioned in the job description]
[Leadership Skills: List management and leadership skills separated by commas]
[Industry Knowledge: List domain expertise separated by commas - align with industry terms in job description]

PROFESSIONAL EXPERIENCE

[Job Title]
[Company Name] | [Location] | [Month Year - Month Year]
• [Action verb] [achievement/task] resulting in [specific metric/result] - Align with job responsibilities
• [Action verb] [achievement/task] leading to [specific metric/result] - Highlight transferable skills
• [Action verb] [achievement/task] improving [specific metric/result] - Emphasize measurable outcomes

[Next Job Title]
[Next Company Name] | [Location] | [Month Year - Month Year]
• [Action verb] [achievement/task] resulting in [specific metric/result] - Connect to job requirements
• [Action verb] [achievement/task] leading to [specific metric/result] - Showcase relevant experience
• [Action verb] [achievement/task] improving [specific metric/result] - Demonstrate value

EDUCATION
[Degree] in [Major]
[University Name] | [Graduation Year]

CERTIFICATIONS
• [Certification Name] - [Issuing Organization] - [Year] - Prioritize industry-recognized certifications

PROJECTS
[Project Name] - [Technologies Used]
• [Brief description with quantified impact] - Emphasize relevance to job

[Next Project Name] - [Technologies Used]
• [Brief description with quantified impact] - Highlight transferable skills

ORIGINAL RESUME:
${text}

ANALYSIS FEEDBACK:
${analysis}

TARGET JOB DESCRIPTION:
${jobDesc}

IMPORTANT: Your primary task is to enhance the resume content to better align with the job description while preserving all factual information from the original resume. Focus on:
1. Incorporating relevant keywords and phrases from the job description
2. Restructuring content to emphasize skills and experiences that match job requirements
3. Quantifying achievements with specific metrics
4. Using action verbs that resonate with the target role
5. Maintaining honesty and accuracy - do not fabricate any information

Return only the enhanced resume content with no explanations, formatting markers, or section labels.`

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