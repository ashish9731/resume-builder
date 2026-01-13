import { NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'

export async function GET() {
  try {
    console.log('=== OPENAI TEST API ===')
    
    // Check if API key is configured
    const apiKey = process.env.OPENAI_API_KEY || (process.env as any).OpenAPIKey
    console.log('API Key present:', !!apiKey)
    console.log('API Key length:', apiKey?.length || 0)
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured',
        details: 'No API key found in environment variables'
      }, { status: 500 })
    }
    
    // Test OpenAI client creation
    try {
      const openai = getOpenAI()
      console.log('OpenAI client created successfully')
      
      // Test simple API call
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10
      })
      
      console.log('Test API call successful')
      console.log('Response:', completion.choices[0]?.message?.content)
      
      return NextResponse.json({
        success: true,
        message: 'OpenAI API is working correctly',
        response: completion.choices[0]?.message?.content
      })
      
    } catch (clientError: any) {
      console.error('OpenAI client error:', clientError)
      return NextResponse.json({
        success: false,
        error: 'OpenAI client error',
        details: clientError.message,
        status: clientError.status
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    }, { status: 500 })
  }
}