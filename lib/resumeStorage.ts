// Supabase storage disabled - All resume data must be downloaded by user
// Authentication only mode enabled

interface ParsedResume {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin?: string;
    location?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  skills: string;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
  }>;
}

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
  // DISABLED: Supabase storage removed per user request
  console.log('Supabase storage disabled - Please download your resume manually');
  console.log('Resume title:', resumeData.title || 'Untitled Resume');
  console.log('Original text length:', resumeData.originalText.length);
  
  // Return null to indicate no storage occurred
  return null;
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
  // DISABLED: Supabase storage removed per user request
  console.log('Interview analysis storage disabled - Please download report manually');
  console.log('Job title:', interviewData.job_title);
  console.log('Questions count:', interviewData.questions.length);
  return null;
}

export async function saveCommunicationAnalysis(
  userId: string,
  analysisData: {
    transcript: string;
    analysis: string;
    recording_url?: string;
  }
): Promise<string | null> {
  // DISABLED: Supabase storage removed per user request
  console.log('Communication analysis storage disabled - Please download report manually');
  console.log('Transcript length:', analysisData.transcript.length);
  return null;
}

export async function getUserAnalyses(userId: string): Promise<any[]> {
  // DISABLED: Supabase storage removed per user request
  console.log('User analyses fetching disabled - All reports must be downloaded manually');
  return [];
}
