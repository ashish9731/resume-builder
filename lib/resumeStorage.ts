import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { ParsedResume } from '@/types/resume'

export async function saveResumeToSupabase(
  resumeData: {
    originalText: string;
    parsedData: ParsedResume;
    aiAnalysis?: string;
    enhancedText?: string;
    templateUsed?: string;
    title?: string;
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
    
    const record: any = {
      user_id: userId,
      title: resumeData.title || 'Untitled Resume',
      original_text: resumeData.originalText,
      parsed_data: resumeData.parsedData,
    };
    
    // Only add optional fields if they exist in the table
    if (resumeData.aiAnalysis !== undefined) record.ai_analysis = resumeData.aiAnalysis;
    if (resumeData.enhancedText !== undefined) record.enhanced_text = resumeData.enhancedText;
    if (resumeData.templateUsed !== undefined) record.template_used = resumeData.templateUsed;

    const { data, error } = await supabase
      .from('saved_resumes')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error saving resume:', error);
      // Handle column not found errors gracefully
      if (error.code === 'PGRST204') {
        console.warn('Column not found in database, saving with minimal data');
        // Try saving with only required fields
        const minimalRecord = {
          user_id: userId,
          original_text: resumeData.originalText,
          parsed_data: resumeData.parsedData,
        };
        
        const { data: minimalData, error: minimalError } = await supabase
          .from('saved_resumes')
          .insert(minimalRecord)
          .select()
          .single();
          
        if (minimalError) {
          console.error('Minimal save also failed:', minimalError);
          return null;
        }
        
        return minimalData.id;
      }
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
      .from('interview_reports')
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
      .from('communication_reports')
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
    
    // Fetch interview reports
    const { data: interviewData, error: interviewError } = await supabase
      .from('interview_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Fetch communication reports
    const { data: communicationData, error: communicationError } = await supabase
      .from('communication_reports')
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
