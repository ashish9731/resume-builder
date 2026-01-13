import { NextResponse } from 'next/server'
import { getOpenAI, systemGuardrails } from '@/lib/openai'

// Using default runtime for AI analysis

export async function POST(req: Request) {
  try {
    // Validate request
    const apiKey = process.env.OPENAI_API_KEY || (process.env as any).OpenAPIKey
    const isOpenAIConfigured = !!apiKey
    
    if (!isOpenAIConfigured) {
      console.log('OpenAI not configured, using fallback analysis')
    }

    const contentType = req.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Request must be JSON' },
        { status: 400 }
      )
    }

    const { text, jobDescription } = await req.json()
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid text parameter' },
        { status: 400 }
      )
    }

    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json(
        { error: 'Job description is required for resume analysis' },
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

    const prompt = `You are a senior resume strategist and ATS expert with 20+ years of experience helping professionals secure top-tier positions. Your analysis has helped thousands of candidates land dream jobs at Fortune 500 companies. Conduct a comprehensive, actionable analysis of this resume with specific focus on alignment with the target job description.

🔍 ANALYSIS MISSION: Identify every opportunity to transform this resume into a powerful career tool that will make recruiters stop and take notice, specifically tailored to the target role.

🎯 TARGET ROLE CONTEXT:
${jobDescription.substring(0, 2000)}

📊 COMPREHENSIVE EVALUATION FRAMEWORK:

**1. ROLE ALIGNMENT ASSESSMENT**
- Match between candidate's experience and job requirements
- Gap analysis between current resume and job description keywords
- Missing skills or experiences that should be emphasized
- Opportunities to reframe existing experience for the target role

**2. STRUCTURAL EXCELLENCE**
- Resume format, organization, and visual hierarchy
- Section completeness, flow, and logical progression
- Professional presentation and readability
- Length optimization and content density

**3. CONTENT POWER ASSESSMENT**
- Professional summary impact and value communication
- Work experience depth, achievement focus, and progression
- Quantifiable accomplishments and measurable impact
- Skills positioning, relevance, and market alignment
- Education presentation and credential value

**4. ATS OPTIMIZATION AUDIT**
- Keyword density, relevance, and strategic placement
- Industry-specific terminology and technical language
- Skills visibility and trending technology inclusion
- Action verb variety and power language usage
- Format compatibility and parsing optimization

**5. COMPETITIVE ADVANTAGE ANALYSIS**
- Unique selling propositions and differentiation factors
- Leadership examples and initiative demonstrations
- Problem-solving capabilities and innovation showcases
- Market positioning and value proposition clarity
- Career progression and growth trajectory

**6. TRANSFORMATION ROADMAP**
- Specific content enhancement opportunities
- Formatting improvements and visual enhancements
- Missing elements and gap identification
- Industry best practices and market standards alignment
- Strategic recommendations for maximum impact

🎯 DELIVERABLE: Provide a detailed, actionable analysis with specific examples from the resume. Focus on concrete improvements that will elevate this resume to perfectly align with the target job description. Include specific recommendations for each section that will make this candidate irresistible to employers for this specific role.

IMPORTANT: Your analysis must directly reference the job description requirements and provide specific guidance on how to align the resume with those requirements.`

    if (isOpenAIConfigured) {
      // Use OpenAI for analysis
      const openai = getOpenAI()
      const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemGuardrails },
          { role: 'user', content: prompt + '\n\nCONTENT:\n' + text.substring(0, 8000) } // Limit input length
        ],
        temperature: 0.1, // Lower temperature for more consistent analysis
        max_tokens: 2000, // Allow much more detailed analysis
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
      // Fallback analysis when OpenAI is not configured
      const fallbackAnalysis = generateFallbackAnalysis(text, jobDescription);
      return NextResponse.json({ analysis: fallbackAnalysis })
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

// Fallback analysis function when OpenAI is not available
function generateFallbackAnalysis(text: string, jobDescription: string): string {
  const timestamp = new Date().toLocaleString();
  
  // Simple analysis based on text content
  const wordCount = text.split(' ').length;
  const lineCount = text.split('\n').length;
  const hasContactInfo = /(@gmail\.com|@yahoo\.com|\(\d{3}\)|[0-9]{3}-[0-9]{3}-[0-9]{4})/i.test(text);
  const hasExperience = /(experience|work|position|role|company)/i.test(text);
  const hasSkills = /(skills|technologies|programming|software)/i.test(text);
  
  return `📋 AUTOMATED RESUME ANALYSIS (Fallback Mode)
Generated: ${timestamp}

📊 BASIC METRICS:
• Word Count: ${wordCount}
• Line Count: ${lineCount}
• Has Contact Info: ${hasContactInfo ? '✅ Yes' : '❌ No'}
• Has Experience Section: ${hasExperience ? '✅ Yes' : '❌ No'}
• Has Skills Section: ${hasSkills ? '✅ Yes' : '❌ No'}

🎯 JOB ALIGNMENT CHECK:
• Target Role Keywords Found: ${countKeywordMatches(text, jobDescription)}
• Industry Terms Matched: ${getIndustryMatches(text, jobDescription)}

⚠️ ACTION ITEMS:
1. ${hasContactInfo ? '✓' : '✗'} Add complete contact information (email, phone, LinkedIn)
2. ${hasExperience ? '✓' : '✗'} Include detailed work experience with achievements
3. ${hasSkills ? '✓' : '✗'} List relevant technical and soft skills
4. ✗ Quantify achievements with specific metrics and numbers
5. ✗ Use industry-standard keywords from job description
6. ✗ Optimize for ATS parsing with proper section headers

📝 RECOMMENDATIONS:
• Structure resume with clear sections: Contact, Summary, Experience, Skills, Education
• Use bullet points for experience entries
• Include specific metrics (increased by X%, managed Y people, etc.)
• Match keywords from job description throughout resume
• Keep formatting clean and professional

💡 PRO TIP: Add your OpenAI API key to enable advanced AI-powered analysis with detailed insights and personalized recommendations.`;
}

function countKeywordMatches(text: string, jobDescription: string): number {
  const keywords = jobDescription.match(/\b(\w{4,})\b/g) || [];
  const uniqueKeywords = [...new Set(keywords)];
  let matches = 0;
  
  for (const keyword of uniqueKeywords) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      matches++;
    }
  }
  
  return matches;
}

function getIndustryMatches(text: string, jobDescription: string): string {
  const techTerms = ['javascript', 'python', 'react', 'node', 'sql', 'api', 'cloud', 'aws', 'docker'];
  const businessTerms = ['management', 'strategy', 'marketing', 'sales', 'finance', 'analytics'];
  
  const textLower = text.toLowerCase();
  const foundTech = techTerms.filter(term => textLower.includes(term));
  const foundBusiness = businessTerms.filter(term => textLower.includes(term));
  
  if (foundTech.length > 0) return `Technical (${foundTech.slice(0, 3).join(', ')})`;
  if (foundBusiness.length > 0) return `Business (${foundBusiness.slice(0, 3).join(', ')})`;
  return 'General';
}