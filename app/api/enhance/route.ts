import { NextResponse } from 'next/server'
import { getOpenAI, systemGuardrails } from '@/lib/openai'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  console.log('=== ENHANCE API DEBUG START ===')
  
  try {
    // Validate request
    console.log('Checking OpenAI API key...')
    const apiKey = process.env.OPENAI_API_KEY || (process.env as any).OpenAPIKey
    const isOpenAIConfigured = !!apiKey
    console.log('API Key present:', isOpenAIConfigured)
    console.log('API Key length:', apiKey?.length || 0)
    
    // Quick OpenAI test
    if (isOpenAIConfigured) {
      try {
        console.log('Testing OpenAI connection...')
        const openai = getOpenAI()
        const testCompletion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        })
        console.log('OpenAI test successful:', testCompletion.choices[0]?.message?.content)
      } catch (testError) {
        console.error('OpenAI test failed:', testError)
        return NextResponse.json(
          { error: 'OpenAI API test failed: ' + (testError as Error).message },
          { status: 500 }
        )
      }
    }
    
    if (!isOpenAIConfigured) {
      console.log('OpenAI not configured, using fallback enhancement')
    }

    const contentType = req.headers.get('content-type')
    console.log('Content-Type:', contentType)
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType)
      return NextResponse.json(
        { error: 'Request must be JSON' },
        { status: 400 }
      )
    }

    console.log('Parsing request body...')
    const requestBody = await req.json()
    console.log('Request body keys:', Object.keys(requestBody))
    
    const { text, analysis, jobDescription } = requestBody
    console.log('Text length:', text?.length || 0)
    console.log('Analysis present:', !!analysis)
    console.log('Job description present:', !!jobDescription)
    
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

    console.log('Creating OpenAI instance...')
    const openai = getOpenAI()
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    console.log('Using model:', model)
    
    console.log('Making OpenAI API call...')
    console.log('Prompt length:', prompt.length)
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemGuardrails },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    })
    
    console.log('OpenAI response received')
    console.log('Choices count:', completion.choices?.length || 0)
    console.log('First choice content length:', completion.choices?.[0]?.message?.content?.length || 0)

    let enhanced = completion.choices[0]?.message?.content ?? ''
    console.log('Enhanced content length:', enhanced.length)
    
    if (!enhanced) {
      console.error('No enhanced content generated')
      return NextResponse.json(
        { error: 'No enhanced content generated' },
        { status: 500 }
      )
    }
    
    console.log('Enhancement successful, returning response')

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
    console.error('=== ENHANCE API ERROR ===')
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      name: error?.name,
      stack: error?.stack,
      code: error?.code,
      type: error?.type
    })
    console.error('Full error object:', JSON.stringify(error, null, 2))
    console.error('Request body that caused error:', {
      hasText: !!text,
      textLength: text?.length || 0,
      hasAnalysis: !!analysis,
      hasJobDescription: !!jobDescription
    })
    console.error('=== END ERROR DETAILS ===')
    
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

// Fallback enhancement function when OpenAI is not available
function generateFallbackEnhancement(text: string, jobDescription: string): string {
  // Simple enhancement: add some basic improvements
  let enhanced = text;
  
  // Add action verbs if missing
  const actionVerbs = ['managed', 'developed', 'implemented', 'led', 'created', 'improved'];
  
  // Add metrics placeholders
  const metrics = ['20%', '30%', '50%', '2x', '3x'];
  
  // Add industry keywords from job description
  const keywords = jobDescription.match(/\b(\w{4,})\b/g) || [];
  const uniqueKeywords = [...new Set(keywords)].slice(0, 5);
  
  // Simple enhancement - add some structure and keywords
  if (!enhanced.toLowerCase().includes('summary') && !enhanced.toLowerCase().includes('profile')) {
    enhanced = `PROFESSIONAL SUMMARY\nExperienced professional with skills in ${uniqueKeywords.join(', ')}.\n\n` + enhanced;
  }
  
  // Add skills section if missing
  if (!enhanced.toLowerCase().includes('skills')) {
    enhanced += `\n\nKEY SKILLS\n${uniqueKeywords.join(', ')}, Communication, Problem-solving, Team Leadership`;
  }
  
  // Add achievements section
  enhanced += `

NOTABLE ACHIEVEMENTS
• Improved processes by ${metrics[0]} through strategic initiatives
• Led cross-functional teams to deliver ${metrics[1]} better results
• Implemented solutions that increased efficiency by ${metrics[2]}`;
  
  return enhanced;
}