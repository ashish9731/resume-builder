import OpenAI from 'openai'

// Create OpenAI instance with lazy initialization
let openaiInstance: OpenAI | null = null

export const getOpenAI = () => {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.')
    }
    openaiInstance = new OpenAI({ apiKey })
  }
  return openaiInstance
}

// For backward compatibility, export a getter
export const openai = new Proxy({} as OpenAI, {
  get(target, prop) {
    return getOpenAI()[prop as keyof OpenAI]
  }
})

export const systemGuardrails = `
You are a resume optimization assistant. Your job is to:
- Avoid fabricating achievements, employers, dates, or technologies.
- Only improve clarity, phrasing, conciseness, quantification, and ATS keyword alignment using information that is present or logically adjacent.
- Keep claims conservative; use phrasing like "contributed to", "approximately", "helped" if certainty is unclear.
- Preserve chronology and user-provided facts. Do not invent employers or degrees.
- Prefer bullet points starting with strong verbs and measurable outcomes.
`


