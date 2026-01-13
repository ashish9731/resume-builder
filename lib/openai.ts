import OpenAI from 'openai'

// Create OpenAI instance with lazy initialization
let openaiInstance: OpenAI | null = null

export const getOpenAI = () => {
  console.log('=== OPENAI INIT DEBUG ===')
  console.log('Existing instance:', !!openaiInstance)
  
  if (!openaiInstance) {
    console.log('Creating new OpenAI instance')
    const apiKey = process.env.OPENAI_API_KEY || (process.env as any).OpenAPIKey
    console.log('API Key present in env:', !!apiKey)
    console.log('API Key length:', apiKey?.length || 0)
    
    if (!apiKey) {
      const error = new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.')
      console.error('OpenAI init error:', error.message)
      throw error
    }
    
    try {
      console.log('Initializing OpenAI client...')
      openaiInstance = new OpenAI({ apiKey })
      console.log('OpenAI client initialized successfully')
    } catch (initError) {
      console.error('OpenAI client initialization failed:', initError)
      throw initError
    }
  }
  
  console.log('Returning OpenAI instance')
  console.log('=== END OPENAI INIT DEBUG ===')
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


