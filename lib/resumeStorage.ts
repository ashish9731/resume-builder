import { getSupabaseBrowser } from './supabaseBrowser';
import { getSupabaseServer } from './supabaseServer';
import { ParsedResume } from '../types/resume';

export interface ResumeRecord {
  id?: string;
  user_id: string;
  original_text: string;
  parsed_data: ParsedResume;
  ai_analysis?: string;
  enhanced_text?: string;
  template_used?: string;
  created_at?: string;
  updated_at?: string;
}

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
  // DISABLED: Temporarily disable Supabase saving for debugging
  console.log('Supabase saving temporarily disabled for debugging');
  return null;
  /*
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
    
    const record: ResumeRecord = {
      user_id: userId,
      original_text: resumeData.originalText,
      parsed_data: resumeData.parsedData,
      ai_analysis: resumeData.aiAnalysis,
      enhanced_text: resumeData.enhancedText,
      template_used: resumeData.templateUsed,
    };

    const { data, error } = await supabase
      .from('resumes')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error saving resume to Supabase:', error);
      // Don't fail the main flow if Supabase save fails
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error saving resume:', error);
    // Don't fail the main flow if Supabase save fails
    return null;
  }
}

export async function getUserResumes(userId: string): Promise<ResumeRecord[]> {
  try {
    const supabase = getSupabaseBrowser();
    
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user resumes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return [];
  }
}

export async function getResumeById(id: string, userId: string): Promise<ResumeRecord | null> {
  try {
    const supabase = getSupabaseBrowser();
    
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching resume:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching resume:', error);
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
  // DISABLED: Temporarily disable Supabase saving for debugging
  console.log('Interview analysis saving temporarily disabled for debugging');
  return null;
  /*
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
  // DISABLED: Temporarily disable Supabase saving for debugging
  console.log('Communication analysis saving temporarily disabled for debugging');
  return null;
  /*
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
    
    const { data, error } = await supabase
      .from('interview_analyses')
      .select('*')
      .eq('user_id', userId)
      .union(
        await supabase
          .from('communication_analyses')
          .select('*')
          .eq('user_id', userId)
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user analyses:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }
}