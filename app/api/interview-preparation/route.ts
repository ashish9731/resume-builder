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
      
      const prompt = `You are an expert interview coach and HR professional with extensive experience in preparing candidates for technical and behavioral interviews. Generate ${count} high-quality, job-specific interview questions based EXCLUSIVELY on the provided job description and candidate resume.

JOB ROLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

CANDIDATE RESUME:
${resume.substring(0, 3000)}

INSTRUCTIONS:
1. Generate exactly ${count} diverse questions that test both technical skills and behavioral competencies
2. Include a mix of:
   - Technical questions relevant to the SPECIFIC technologies, tools, and responsibilities mentioned in the job description
   - Behavioral questions about SPECIFIC experiences detailed in the candidate's resume
   - Situational judgment questions based on challenges mentioned in the job description
   - Problem-solving scenarios using technologies or methodologies from both the job description and resume
3. CRITICAL: Every question MUST directly reference:
   - Specific skills, technologies, or requirements from the job description
   - Specific experiences, projects, or achievements from the candidate's resume
4. Vary question difficulty from foundational to advanced based on the candidate's experience level
5. Focus on assessing both hard skills (technical competencies) and soft skills (leadership, communication, problem-solving)
6. ABSOLUTELY FORBIDDEN: Generic questions like "Tell me about yourself", "What are your strengths/weaknesses?", "Where do you see yourself in 5 years?"
7. Ensure questions are open-ended to encourage detailed responses that showcase the candidate's relevant experience

Return ONLY a JSON array of exactly ${count} questions as strings, with no additional text, formatting, or explanations. Each question should be highly specific to the job-role combination.`

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

      const prompt = `You are an expert interview evaluator who provides honest, constructive feedback to help candidates improve. Analyze this interview session and give specific, actionable feedback.

INTERVIEW DATA:
${JSON.stringify(interviewHistory.slice(0, 10), null, 2)}

Provide analysis in these areas:

📊 OVERALL SCORE (out of 10)
Give a final score based on the quality of responses

💬 RESPONSE QUALITY
- How well did they answer each question?
- Did they provide specific examples?
- Was their experience relevant to the questions?

🗣️ COMMUNICATION SKILLS
- How clear and articulate were their answers?
- Did they speak confidently?
- Was their tone professional?

🧠 PROBLEM-SOLVING
- How well did they think through challenges?
- Did they show logical reasoning?
- Were their solutions practical?

🎯 JOB ALIGNMENT
- How well do their skills match the role?
- Did they highlight relevant experience?
- Were they enthusiastic about the position?

Provide specific examples from their actual answers and give clear suggestions for improvement. Be encouraging but honest about areas that need work.`

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