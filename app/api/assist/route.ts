import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 30

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
    
    switch (section) {
      case 'summary':
        prompt = `Create a powerful professional summary for ${context || 'a professional'}. Write 3-4 compelling sentences that:
        - Lead with years of experience and core expertise
        - Include 2-3 key achievements or impact statements
        - Use industry-specific keywords and power phrases
        - Make the candidate irresistible to employers
        - Focus on value delivery and professional excellence`
        break
      case 'experience':
        prompt = `Write 4-5 achievement-focused bullet points for ${context || 'a professional position'}. Each bullet should:
        - Start with powerful action verbs (Spearheaded, Orchestrated, Pioneered, Transformed, Accelerated)
        - Include quantifiable impact where logical (increased efficiency by X%, reduced costs by $Y, managed team of Z)
        - Highlight specific technologies, tools, and methodologies used
        - Show leadership, innovation, and problem-solving examples
        - Demonstrate progression and growth in responsibilities`
        break
      case 'skills':
        prompt = `Generate a comprehensive, strategically organized skills list for ${context || 'a professional'}. Organize into categories:
        - Technical Expertise: Include trending technologies and in-demand skills
        - Leadership & Management: Soft skills and leadership capabilities
        - Industry Knowledge: Domain-specific expertise
        Format as comma-separated values within each category.`
        break
      case 'project':
        prompt = `Write a detailed, compelling project description for "${context || 'a project'}". Include:
        - Clear project objectives and scope
        - Technologies, tools, and methodologies used
        - Challenges overcome and innovative solutions implemented
        - Quantifiable results and impact achieved
        - Leadership and collaboration aspects
        Make it achievement-focused and ATS-optimized.`
        break
      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

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