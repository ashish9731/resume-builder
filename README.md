# AI Resume Builder (Next.js + Supabase)

Optimize, analyze, and enhance resumes with AI. Upload PDF/DOCX/TXT or create a new resume with per-section AI assistance. Practice communication skills and prepare for interviews with AI-powered tools. Export ATS-aligned results as PDF.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Configure Supabase Auth:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Set Site URL: `http://localhost:3000`
   - Add Redirect URL: `http://localhost:3000/app`
   - Enable Email/Password and optionally Google provider

4. **Run development server:**
   ```bash
   npm run dev
   ```

## Key Routes

- `/` - Home page with CTA
- `/auth` - Supabase authentication UI
- `/app` - Protected application hub
- `/app/upload` - Upload resume & analyze/enhance
- `/app/create` - Create new resume with AI assist
- `/app/communication-coach` - Analyze speech clarity, pacing, and confidence
- `/app/interview-prep` - Practice interviews with AI-generated questions

## API Endpoints

- `POST /api/parse` - Parse uploaded files (multipart form data)
- `POST /api/analyze` - Analyze resume content (`{ text }`)
- `POST /api/enhance` - Enhance resume with AI (`{ text, analysis? }`)
- `POST /api/assist` - Get AI assistance for sections (`{ section, input }`)
- `POST /api/pdf` - Generate PDF from text (`{ text }`)
- `POST /api/communication-coach` - Analyze speech clarity, pacing, and confidence (`{ transcript }`)
- `POST /api/interview-prep` - Generate interview questions and analyze performance (`{ action, jobTitle, jobDescription, resume, questionCount, interviewHistory }`)

## Deployment (Vercel)

1. Import this repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

**Note:** Update Supabase redirect URLs to include your production domain.

## Features

- ✅ PDF, DOCX, TXT file upload and parsing
- ✅ AI-powered resume analysis and recommendations
- ✅ ATS-optimized resume enhancement
- ✅ Per-section AI assistance for new resumes
- ✅ PDF export functionality
- ✅ Communication Coach - Analyze speech clarity, pacing, and confidence
- ✅ Interview Prep - Practice with AI-generated job-specific questions
- ✅ Responsive design for all devices
- ✅ Supabase authentication (no data storage)
- ✅ Anti-hallucination measures in AI prompts

## Troubleshooting

- **Build errors:** Ensure all environment variables are set
- **Auth issues:** Check Supabase redirect URL configuration
- **File parsing:** PDF parsing requires Node.js runtime (configured)
- **OpenAI errors:** Verify API key is valid and has sufficient credits

// Trigger Vercel deployment Tue Jan 13 09:45:41 IST 2026
