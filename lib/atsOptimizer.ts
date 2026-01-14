import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ATSOptimizationResult {
  optimizedResume: any
  missingKeywords: string[]
  changes: Array<{
    section: string
    original: string
    optimized: string
    reason: string
  }>
}

export async function optimizeResumeForATS(
  resumeData: any,
  jobDescription: string
): Promise<ATSOptimizationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `
You are an ATS (Applicant Tracking System) optimization expert.
Your task is to optimize resumes for better ATS scoring while following strict rules:

RULES:
❌ DO NOT add fake skills or experience
❌ DO NOT invent new accomplishments
❌ DO NOT change factual information
✅ Only rewrite existing content to include relevant keywords
✅ Preserve the candidate's actual experience and qualifications
✅ Highlight missing keywords separately for user approval

Return JSON in this exact format:
{
  "optimizedResume": { /* modified resume data */ },
  "missingKeywords": ["keyword1", "keyword2"],
  "changes": [
    {
      "section": "experience/work/summary",
      "original": "original content",
      "optimized": "optimized content with keywords",
      "reason": "explanation of changes"
    }
  ]
}
`
        },
        {
          role: 'user',
          content: JSON.stringify({
            resume: resumeData,
            jobDescription: jobDescription
          })
        }
      ]
    })

    const result = JSON.parse(response.choices[0]?.message?.content || '{}')
    return result as ATSOptimizationResult

  } catch (error) {
    console.error('ATS optimization error:', error)
    throw new Error('Failed to optimize resume for ATS')
  }
}

export async function analyzeJDGap(resumeData: any, jobDescription: string) {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: `
You are a resume gap analyzer. Identify missing skills, experience, and keywords between a resume and job description.
Be honest and specific. Only mention actual gaps - do not invent requirements.

Return JSON in this format:
{
  "missingSkills": ["skill1", "skill2"],
  "missingExperience": ["experience area 1", "experience area 2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "atRiskSections": ["section1", "section2"],
  "strengths": ["strength1", "strength2"]
}
`
        },
        {
          role: 'user',
          content: JSON.stringify({
            resume: resumeData,
            jobDescription: jobDescription
          })
        }
      ]
    })

    return JSON.parse(response.choices[0]?.message?.content || '{}')

  } catch (error) {
    console.error('JD gap analysis error:', error)
    throw new Error('Failed to analyze job description gaps')
  }
}