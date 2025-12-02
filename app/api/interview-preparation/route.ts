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

    const body = await req.json()
    const { action } = body
    
    // Validate action
    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid action parameter' },
        { status: 400 }
      )
    }

    const openai = getOpenAI()
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'

    if (action === 'generateQuestions') {
      const { jobTitle, jobDescription, resume, questionCount } = body
      
      // Validate inputs
      if (!jobTitle || !jobDescription || !resume) {
        return NextResponse.json(
          { error: 'Missing required parameters: jobTitle, jobDescription, and resume are required' },
          { status: 400 }
        )
      }

      const count = Math.min(Math.max(questionCount || 5, 1), 10)
      
      const prompt = `You are an expert interview coach and HR professional with extensive experience in preparing candidates for technical and behavioral interviews. Generate ${count} high-quality, job-specific interview questions based on the provided information.

JOB ROLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

CANDIDATE RESUME:
${resume.substring(0, 3000)}

INSTRUCTIONS:
1. Generate exactly ${count} diverse questions that test both technical skills and behavioral competencies
2. Include a mix of:
   - Technical questions relevant to the job role
   - Behavioral questions about past experiences
   - Situational judgment questions
   - Problem-solving scenarios
3. Make questions specific to the candidate's background and the job requirements
4. Vary question difficulty from foundational to advanced
5. Focus on assessing both hard skills and soft skills
6. Avoid generic questions like "Tell me about yourself"
7. Ensure questions are open-ended to encourage detailed responses

Return ONLY a JSON array of exactly ${count} questions as strings, with no additional text, formatting, or explanations.`

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemGuardrails },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      let questions = completion.choices[0]?.message?.content ?? ''
      
      if (!questions) {
        return NextResponse.json(
          { error: 'No questions generated' },
          { status: 500 }
        )
      }

      // Try to parse as JSON, if that fails return as plain text
      let parsedQuestions: any = questions;
      try {
        parsedQuestions = JSON.parse(questions);
      } catch (e) {
        // If JSON parsing fails, try to extract questions from text
        const questionMatches = questions.match(/"[^"]+"|'[^']+'/g);
        if (questionMatches && questionMatches.length > 0) {
          parsedQuestions = questionMatches.map((q: string) => q.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
        } else {
          // If we can't extract questions, return the raw text split by newlines
          parsedQuestions = questions.split('\n').filter((q: string) => q.trim().length > 10);
        }
      }

      // Ensure we have an array
      let questionsArray: string[] = [];
      if (Array.isArray(parsedQuestions)) {
        questionsArray = parsedQuestions;
      } else if (typeof parsedQuestions === 'string') {
        questionsArray = [parsedQuestions];
      } else {
        questionsArray = [String(questions)];
      }

      // Limit to requested count
      questionsArray = questionsArray.slice(0, count);

      return NextResponse.json({ questions: questionsArray });

    } else if (action === 'analyzeInterview') {
      const { interviewHistory } = body
      
      // Validate inputs
      if (!interviewHistory || !Array.isArray(interviewHistory)) {
        return NextResponse.json(
          { error: 'Missing or invalid interviewHistory parameter' },
          { status: 400 }
        )
      }

      const prompt = `You are an expert interview coach and HR professional with decades of experience evaluating candidate performance. Provide a comprehensive analysis of this interview session.

INTERVIEW SESSION DATA:
${JSON.stringify(interviewHistory.slice(0, 10), null, 2)}

ANALYSIS FRAMEWORK:

**1. OVERALL PERFORMANCE ASSESSMENT**
- Overall interview strength and areas for improvement
- Consistency across responses
- Professionalism and communication effectiveness
- Alignment with job requirements

**2. RESPONSE QUALITY EVALUATION**
- Depth and relevance of answers
- Use of STAR method (Situation, Task, Action, Result)
- Specific examples and quantifiable achievements
- Problem-solving approach and critical thinking

**3. COMMUNICATION ANALYSIS**
- Clarity and articulation
- Confidence and tone
- Active listening and question understanding
- Engagement and enthusiasm

**4. TECHNICAL COMPETENCY ASSESSMENT**
- Technical knowledge demonstration
- Problem-solving methodology
- Innovation and creativity
- Learning agility and adaptability

**5. BEHAVIORAL COMPETENCIES**
- Leadership and teamwork examples
- Conflict resolution skills
- Adaptability and resilience
- Cultural fit indicators

**6. IMPROVEMENT ROADMAP**
- Specific recommendations for each area
- Practice exercises and preparation strategies
- Resources for skill development
- Mock interview scenarios for improvement

DELIVERABLE: Provide a detailed, actionable analysis with specific examples from the interview session. Focus on concrete improvements that will elevate this candidate's interview performance. Include both strengths to leverage and areas for development with specific action items.

Return a comprehensive analysis focusing on the areas above, with specific examples and actionable recommendations.`

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
    } else {
      return NextResponse.json(
        { error: 'Invalid action parameter. Must be "generateQuestions" or "analyzeInterview"' },
        { status: 400 }
      )
    }

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