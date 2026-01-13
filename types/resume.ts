export interface ResumeData {
  header: {
    name?: string;
    title?: string;
    location?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  summary?: string;
  skills?: string[];
  experience?: Experience[];
  education?: string[];
  certifications?: string[];
  projects?: string[];
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  points: string[];
}

export interface ParsedResume {
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