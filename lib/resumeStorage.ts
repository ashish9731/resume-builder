import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { ParsedResume } from '@/types/resume'

export async function saveResumeToSupabase(
  resumeData: {
    originalText: string;
    parsedData: ParsedResume;
    aiAnalysis?: string;
    enhancedText?: string;
    templateUsed?: string;
  },
  userId: string
): Promise<string | null> {
  try {
    const supabase = getSupabaseBrowser();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.warn('Auth error, skipping Supabase save:', authError.message);
      return null;
    }
    
    if (!user) {
      console.warn('User not authenticated, skipping Supabase save');
      return null;
    }
    
    const record = {
      user_id: userId,
      original_text: resumeData.originalText,
      parsed_data: resumeData.parsedData,
      ai_analysis: resumeData.aiAnalysis,
      enhanced_text: resumeData.enhancedText,
      template_used: resumeData.templateUsed,
    };

    const { data, error } = await supabase
      .from('saved_resumes')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error saving resume:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error saving resume:', error);
    return null;
  }
}

export async function saveInterviewAnalysis(
  userId: string,
  interviewData: {
    job_title: string;
    job_description: string;
    resume_text: string;
    questions: string[];
    responses: { question: string; response: string }[];
    analysis: string;
    score?: number;
  }
): Promise<string | null> {
  try {
    const supabase = getSupabaseBrowser();
    
    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('User not authenticated, skipping interview analysis save');
      return null;
    }
    
    const { data, error } = await supabase
      .from('interview_analyses')
      .insert({
        user_id: userId,
        ...interviewData
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving interview analysis:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error saving interview analysis:', error);
    return null;
  }
}

export async function saveCommunicationAnalysis(
  userId: string,
  analysisData: {
    transcript: string;
    analysis: string;
    recording_url?: string;
  }
): Promise<string | null> {
  try {
    const supabase = getSupabaseBrowser();
    
    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('User not authenticated, skipping communication analysis save');
      return null;
    }
    
    const { data, error } = await supabase
      .from('communication_analyses')
      .insert({
        user_id: userId,
        ...analysisData
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving communication analysis:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error saving communication analysis:', error);
    return null;
  }
}

export async function getUserAnalyses(userId: string): Promise<any[]> {
  try {
    const supabase = getSupabaseBrowser();
    
    // Fetch interview analyses
    const { data: interviewData, error: interviewError } = await supabase
      .from('interview_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Fetch communication analyses
    const { data: communicationData, error: communicationError } = await supabase
      .from('communication_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Combine and sort results
    const allData = [
      ...(interviewData || []),
      ...(communicationData || [])
    ].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    
    const error = interviewError || communicationError;

    if (error) {
      console.error('Error fetching user analyses:', error);
      return [];
    }

    return allData;
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }
}
