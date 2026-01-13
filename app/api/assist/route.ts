import { NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const { section, context, resumeData } = await req.json()

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 })
    }

    let prompt = ''
    
    // Add randomness factor to make responses more varied
    const randomSeed = Math.random().toString(36).substring(7)
    
    switch (section) {
      case 'summary':
        prompt = `Create a unique professional summary for ${context || 'a professional'}. Write 3-4 compelling sentences that:
        - Lead with distinctive expertise and unique value proposition
        - Include specific achievements or impact stories
        - Use fresh, industry-appropriate language
        - Stand out from generic templates
        - Reflect authentic professional voice
        Random seed: ${randomSeed}`
        break
      case 'experience':
        prompt = `Write 4-5 distinctive achievement-focused bullet points for ${context || 'a professional position'}. Each bullet should:
        - Use varied action verbs (Led, Engineered, Optimized, Spearheaded, Delivered)
        - Include concrete metrics and outcomes
        - Showcase unique challenges solved
        - Highlight specialized skills and tools
        - Demonstrate clear career progression
        Random seed: ${randomSeed}`
        break
      case 'skills':
        prompt = `Generate a tailored skills list for ${context || 'a professional'}. Organize naturally:
        - Core competencies and technical strengths
        - Leadership and collaborative abilities
        - Industry-specific knowledge
        - Emerging skills and continuous learning
        Use varied formatting and avoid repetition
        Random seed: ${randomSeed}`
        break
      case 'project':
        prompt = `Write a unique project description for "${context || 'a project'}". Include:
        - Specific goals and innovative approaches
        - Cutting-edge technologies and methodologies
        - Real challenges addressed and creative solutions
        - Measurable outcomes and business impact
        - Team collaboration and leadership roles
        Random seed: ${randomSeed}`
        break
      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer specializing in ATS-optimized content. Generate concise, achievement-focused content without fabricating data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500, // Allow more detailed content
      temperature: 0.3, // Lower temperature for more professional output
    })

    const suggestion = completion.choices[0]?.message?.content?.trim() || ''

    return NextResponse.json({ suggestion })

  } catch (error: any) {
    console.error('AI assist error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI assistance' },
      { status: 500 }
    )
  }
}