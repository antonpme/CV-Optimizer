# Technical Specifications
## AI-Powered CV Optimization Platform — Solo MVP v1.1

### 0. Solo MVP Overview (Authoritative for v1.1)
- Architecture: Next.js 14 on Vercel + Supabase (Auth, Postgres with RLS, Storage)
- AI: OpenAI (GPT‑4o‑mini default; GPT‑4o optional) with JSON schema outputs
- Storage: Supabase Storage (DOCX/TXT only in MVP); presigned uploads
- Processing: Synchronous, sequential per JD (no queues in MVP)
- Job Descriptions: Paste-only (no web scraping in MVP)
- Exports: HTML and DOCX; PDF later
- Rate Limiting: Upstash Ratelimit; per-user quotas
- Payments: Stripe subscriptions for Pro (optional post-MVP)
- Observability: Sentry + Vercel logs; AI usage logged in DB

### 1. System Architecture

#### 1.1 Overall Architecture
```
Frontend (Next.js/React) → Backend API (Node.js/Express) → 
Services (AI, File Processing, Scraping) → Database (PostgreSQL) → 
File Storage (AWS S3) → External APIs (OpenAI, Claude)
```

#### 1.2 Component Overview
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend API**: Express.js with TypeScript
- **Database**: PostgreSQL 15 with Prisma ORM
- **File Storage**: AWS S3 with CloudFront CDN
- **AI Services**: OpenAI GPT-4/Claude 3 API integration
- **Authentication**: JWT with refresh tokens
- **Queue System**: Bull Queue with Redis
- **Monitoring**: Winston logging, Prometheus metrics

### 2. Technology Stack

#### 2.1 Frontend Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.0+
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts

#### 2.2 Backend Technologies
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.18+
- **Language**: TypeScript 5.0+
- **ORM**: Prisma 5.0+
- **Validation**: Zod
- **Authentication**: jsonwebtoken, bcrypt
- **File Processing**: multer, pdf-parse, mammoth
- **Web Scraping**: puppeteer, cheerio
- **Queue**: Bull Queue
- **Cache**: Redis
- **Logging**: Winston

#### 2.3 Database Technologies
- **Database**: PostgreSQL 15+
- **Connection Pool**: pg
- **Migrations**: Prisma Migrate
- **Seeding**: Prisma Seed

#### 2.4 Infrastructure Technologies
- **Containerization**: Docker
- **Orchestration**: Docker Compose (dev), Kubernetes (prod)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack
- **CDN**: CloudFront
- **Storage**: AWS S3

### 3. Database Schema (MVP Supabase)

#### 3.1 Core Tables

```sql
-- profiles (linked to auth.users)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  job_title text,
  location text,
  professional_summary text,
  website_url text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  embellishment_level int2 default 3 check (embellishment_level between 1 and 5),
  data_retention_days int2 default 90,
  ai_training_consent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- cvs
create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  original_filename text,
  docx_path text, -- Supabase Storage path (optional)
  text_content text not null,
  is_reference boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- job_descriptions (pasted only in MVP)
create table if not exists public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  company text,
  text_content text not null,
  keywords jsonb,
  created_at timestamptz default now()
);

-- generated_cvs (tailored outputs per JD)
create table if not exists public.generated_cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cv_id uuid not null references public.cvs(id) on delete cascade,
  jd_id uuid not null references public.job_descriptions(id) on delete cascade,
  tailored_text text not null,
  optimization_notes jsonb,
  match_score numeric(4,2),
  status text default 'pending' check (status in ('pending','completed','approved','rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ai_runs (usage and cost tracking)
create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_type text not null check (run_type in ('optimize_cv','analyze_jd','generate_tailored_cv')),
  provider text not null default 'openai',
  model text not null,
  tokens_input int default 0,
  tokens_output int default 0,
  cost_usd numeric(8,4) default 0,
  status text default 'success' check (status in ('success','failed')),
  metadata jsonb,
  created_at timestamptz default now()
);
```

#### 3.2 Indexes & RLS Policies (examples)
```sql
create index if not exists idx_cvs_user on public.cvs(user_id, created_at desc);
create index if not exists idx_jd_user on public.job_descriptions(user_id, created_at desc);
create index if not exists idx_gc_user on public.generated_cvs(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.cvs enable row level security;
alter table public.job_descriptions enable row level security;
alter table public.generated_cvs enable row level security;
alter table public.ai_runs enable row level security;

create policy profiles_owner on public.profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cvs_owner on public.cvs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy jd_owner on public.job_descriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy gc_owner on public.generated_cvs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ai_runs_owner on public.ai_runs
  for select using (user_id = auth.uid());
```

### 3. Database Schema

#### 3.1 Core Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    professional_summary TEXT,
    job_title VARCHAR(100),
    experience_level VARCHAR(50),
    industry VARCHAR(100),
    website_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    twitter_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ai_embellishment_level INTEGER DEFAULT 3 CHECK (ai_embellishment_level >= 1 AND ai_embellishment_level <= 5),
    notification_email BOOLEAN DEFAULT true,
    notification_in_app BOOLEAN DEFAULT true,
    data_retention_days INTEGER DEFAULT 90,
    ai_training_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CVs table
CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    extracted_text TEXT NOT NULL,
    is_reference BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optimized CVs table
CREATE TABLE optimized_cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
    optimized_text TEXT NOT NULL,
    optimization_summary JSONB,
    ai_model_used VARCHAR(50),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job descriptions table
CREATE TABLE job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    title VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    description TEXT NOT NULL,
    requirements TEXT,
    keywords JSONB,
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT
);

-- Generated CVs table
CREATE TABLE generated_cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    optimized_cv_id UUID REFERENCES optimized_cvs(id) ON DELETE CASCADE,
    job_description_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
    generated_content TEXT NOT NULL,
    optimization_notes JSONB,
    match_score DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cover letters table
CREATE TABLE cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    generated_cv_id UUID REFERENCES generated_cvs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Processing jobs table
CREATE TABLE processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('cv_optimization', 'jd_extraction', 'cv_generation', 'cover_letter')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0,
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT false,
    device_info JSONB
);
```

#### 3.2 Indexes
```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cvs_user_id ON cvs(user_id);
CREATE INDEX idx_job_descriptions_user_id ON job_descriptions(user_id);
CREATE INDEX idx_generated_cvs_user_id ON generated_cvs(user_id);
CREATE INDEX idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

### 4. API Endpoints (MVP)

#### 4.1 Authentication (Supabase)
Managed by Supabase Auth (email/magic links). Next.js uses Supabase SSR helpers.

#### 4.2 Profile & Settings
```typescript
// GET /api/profile
// PUT /api/profile
```

#### 4.3 CV Management
```typescript
// POST /api/cv  // upload DOCX/TXT or paste text
// GET  /api/cv
// GET  /api/cv/:id
// POST /api/cv/:id/optimize  // create/update Reference CV with change summary
// PUT  /api/cv/:id/reference // toggle reference
```

#### 4.4 Job Descriptions (Paste only)
```typescript
// POST /api/jd  // items: [{ title?, company?, text }]
// GET  /api/jd
// GET  /api/jd/:id
// DELETE /api/jd/:id
```

#### 4.5 CV Generation
```typescript
// POST /api/generate            // body: { referenceCvId, jobDescriptionIds[] (<=5) }
// GET  /api/generated
// GET  /api/generated/:id
// PUT  /api/generated/:id/approve
// PUT  /api/generated/:id/reject
```

#### 4.6 Export
```typescript
// POST /api/export/cv/:id       // format: 'html' | 'docx' | 'txt' (pdf later)
```

-- The detailed Phase 2+ API remains below for reference.

### 4. API Endpoints

#### 4.1 Authentication Endpoints

```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
  };
  message: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  accessToken: string;
  refreshToken: string;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// POST /api/auth/logout
interface LogoutRequest {
  refreshToken: string;
}

interface LogoutResponse {
  message: string;
}
```

#### 4.2 User Management Endpoints

```typescript
// GET /api/users/profile
interface UserProfileResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    location?: string;
  };
  profile: {
    professionalSummary?: string;
    jobTitle?: string;
    experienceLevel?: string;
    industry?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    twitterUrl?: string;
  };
}

// PUT /api/users/profile
interface UpdateProfileRequest {
  professionalSummary?: string;
  jobTitle?: string;
  experienceLevel?: string;
  industry?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  twitterUrl?: string;
}

// GET /api/users/settings
interface UserSettingsResponse {
  settings: {
    aiEmbellishmentLevel: number;
    notificationEmail: boolean;
    notificationInApp: boolean;
    dataRetentionDays: number;
    aiTrainingConsent: boolean;
  };
}

// PUT /api/users/settings
interface UpdateSettingsRequest {
  aiEmbellishmentLevel?: number;
  notificationEmail?: boolean;
  notificationInApp?: boolean;
  dataRetentionDays?: number;
  aiTrainingConsent?: boolean;
}
```

#### 4.3 CV Management Endpoints

```typescript
// POST /api/cvs/upload
interface CVUploadRequest {
  file: File;
}

interface CVUploadResponse {
  cv: {
    id: string;
    originalFilename: string;
    fileSize: number;
    fileType: string;
    extractedText: string;
    isReference: boolean;
    createdAt: string;
  };
  processingJob: {
    id: string;
    status: string;
    progress: number;
  };
}

// GET /api/cvs
interface CVsResponse {
  cvs: Array<{
    id: string;
    originalFilename: string;
    fileSize: number;
    fileType: string;
    isReference: boolean;
    createdAt: string;
    optimizedVersion?: {
      id: string;
      confidenceScore: number;
      createdAt: string;
    };
  }>;
}

// GET /api/cvs/:id
interface CVResponse {
  cv: {
    id: string;
    originalFilename: string;
    fileSize: number;
    fileType: string;
    extractedText: string;
    isReference: boolean;
    createdAt: string;
  };
  optimizedVersion?: {
    id: string;
    optimizedText: string;
    optimizationSummary: any;
    confidenceScore: number;
    createdAt: string;
  };
}

// POST /api/cvs/:id/optimize
interface OptimizeCVRequest {
  embellishmentLevel?: number;
}

interface OptimizeCVResponse {
  processingJob: {
    id: string;
    status: string;
    progress: number;
  };
}

// PUT /api/cvs/:id/reference
interface SetReferenceCVResponse {
  message: string;
  cv: {
    id: string;
    isReference: boolean;
  };
}
```

_Implementation (MVP) currently uses Next.js server actions (`uploadCv`, `setReferenceCv`) to achieve the same behaviour: DOCX/TXT (≤5MB) ingestion via Supabase Storage, pasted-text support, and automatic reference selection._

#### 4.4 Job Description Endpoints

```typescript
// POST /api/job-descriptions
interface AddJobDescriptionsRequest {
  urls: string[];
}

interface AddJobDescriptionsResponse {
  processingJobs: Array<{
    id: string;
    url: string;
    status: string;
    progress: number;
  }>;
}

_Implementation (MVP) uses server action `addJobDescription` to persist pasted text with optional title/company, enforcing 20-role limit per user._

// GET /api/job-descriptions
interface JobDescriptionsResponse {
  jobDescriptions: Array<{
    id: string;
    url: string;
    title?: string;
    company?: string;
    location?: string;
    status: string;
    extractedAt: string;
    keywords?: string[];
  }>;
}

// GET /api/job-descriptions/:id
interface JobDescriptionResponse {
  jobDescription: {
    id: string;
    url: string;
    title?: string;
    company?: string;
    location?: string;
    description: string;
    requirements?: string;
    keywords?: string[];
    status: string;
    extractedAt: string;
  };
}

// DELETE /api/job-descriptions/:id
interface DeleteJobDescriptionResponse {
  message: string;
}
```

#### 4.5 CV Generation Endpoints

```typescript
// POST /api/generated-cvs
interface GenerateCVsRequest {
  optimizedCvId: string;
  jobDescriptionIds: string[];
  includeCoverLetters?: boolean;
}

interface GenerateCVsResponse {
  processingJobs: Array<{
    id: string;
    jobDescriptionId: string;
    status: string;
    progress: number;
  }>;
}

_MVP implementation: server action `generateTailoredCvs` iterates selected job IDs, calls OpenAI tailored prompt, writes to `generated_cvs`, and records usage in `ai_runs`._

// GET /api/generated-cvs
interface GeneratedCVsResponse {
  generatedCvs: Array<{
    id: string;
    jobDescription: {
      id: string;
      title?: string;
      company?: string;
      url: string;
    };
    matchScore?: number;
    status: string;
    createdAt: string;
    coverLetter?: {
      id: string;
      tone?: string;
      createdAt: string;
    };
  }>;
}

// GET /api/generated-cvs/:id
interface GeneratedCVResponse {
  generatedCv: {
    id: string;
    generatedContent: string;
    optimizationNotes?: any;
    matchScore?: number;
    status: string;
    createdAt: string;
  };
  jobDescription: {
    id: string;
    title?: string;
    company?: string;
    description: string;
    requirements?: string;
    keywords?: string[];
  };
  coverLetter?: {
    id: string;
    content: string;
    tone?: string;
    createdAt: string;
  };
}

// PUT /api/generated-cvs/:id/approve
interface ApproveCVResponse {
  message: string;
  generatedCv: {
    id: string;
    status: string;
  };
}

// PUT /api/generated-cvs/:id/reject
interface RejectCVResponse {
  message: string;
  generatedCv: {
    id: string;
    status: string;
  };
}

// POST /api/generated-cvs/:id/regenerate
interface RegenerateCVRequest {
  embellishmentLevel?: number;
  tone?: string;
}

interface RegenerateCVResponse {
  processingJob: {
    id: string;
    status: string;
    progress: number;
  };
}
```

#### 4.6 Processing Job Endpoints

```typescript
// GET /api/processing-jobs
interface ProcessingJobsResponse {
  processingJobs: Array<{
    id: string;
    jobType: string;
    status: string;
    progress: number;
    createdAt: string;
    completedAt?: string;
    errorMessage?: string;
  }>;
}

// GET /api/processing-jobs/:id
interface ProcessingJobResponse {
  processingJob: {
    id: string;
    jobType: string;
    status: string;
    progress: number;
    input?: any;
    output?: any;
    errorMessage?: string;
    createdAt: string;
    completedAt?: string;
  };
}
```

#### 4.7 Export Endpoints

```typescript
// POST /api/export/cv/:id
interface ExportCVRequest {
  format: 'pdf' | 'docx' | 'txt' | 'html';
  template?: string;
  includeMetadata?: boolean;
}

interface ExportCVResponse {
  downloadUrl: string;
  expiresAt: string;
}

// POST /api/export/cover-letter/:id
interface ExportCoverLetterRequest {
  format: 'pdf' | 'docx' | 'txt';
  template?: string;
}

interface ExportCoverLetterResponse {
  downloadUrl: string;
  expiresAt: string;
}

// POST /api/export/bulk
interface ExportBulkRequest {
  generatedCvIds: string[];
  format: 'pdf' | 'docx' | 'zip';
  includeCoverLetters?: boolean;
}

interface ExportBulkResponse {
  downloadUrl: string;
  expiresAt: string;
}
```

### 5. AI Integration

#### 5.1 AI Prompts

##### 5.1.1 CV Optimization Prompt
```
You are an expert CV optimizer and career coach. Your task is to optimize the provided CV to make it more effective for job applications.

**CV Optimization Guidelines:**
1. Enhance clarity and impact of achievements
2. Use strong action verbs and quantifiable results
3. Improve formatting and structure
4. Highlight relevant skills and experiences
5. Remove irrelevant or redundant information
6. Ensure professional tone and language
7. Optimize for ATS (Applicant Tracking Systems)

**Embellishment Level: {level} (1-5)**
- Level 1: Minimal changes, mostly formatting and clarity
- Level 2: Moderate improvements, focus on clarity and impact
- Level 3: Standard optimization, balance of enhancement and accuracy
- Level 4: Aggressive optimization, emphasize strengths and achievements
- Level 5: Maximum enhancement, highlight potential and capabilities

**Input CV:**
{cv_text}

**User Profile:**
{profile_data}

**Output Format:**
Provide the optimized CV in a clean, professional format. Include a summary of changes made and the confidence level for each optimization.

**Response Structure:**
{
  "optimized_cv": "optimized CV content",
  "changes_summary": [
    {
      "section": "section_name",
      "change": "description of change",
      "confidence": 0.95
    }
  ],
  "overall_confidence": 0.92,
  "recommendations": ["additional suggestions"]
}
```

##### 5.1.2 Job Description Analysis Prompt
```
You are an expert recruiter and job analyst. Your task is to analyze the provided job description and extract key information for CV optimization.

**Job Description Analysis Requirements:**
1. Extract job title and company information
2. Identify key requirements and qualifications
3. Extract technical skills and tools mentioned
4. Identify soft skills and personality traits
5. Determine experience level and seniority
6. Extract industry-specific keywords
7. Identify company culture indicators
8. Categorize requirements as "must-have" vs "nice-to-have"

**Input Job Description:**
{job_description_text}

**Output Format:**
Provide structured analysis of the job description with categorized information.

**Response Structure:**
{
  "job_title": "extracted title",
  "company": "company name",
  "location": "job location",
  "experience_level": "entry/mid/senior/executive",
  "key_requirements": [
    {
      "requirement": "specific requirement",
      "category": "technical/soft/education",
      "importance": "must-have/nice-to-have",
      "keywords": ["related", "keywords"]
    }
  ],
  "technical_skills": ["skill1", "skill2"],
  "soft_skills": ["skill1", "skill2"],
  "education_requirements": ["requirement1", "requirement2"],
  "certifications": ["cert1", "cert2"],
  "company_culture_indicators": ["indicator1", "indicator2"],
  "industry_keywords": ["keyword1", "keyword2"]
}
```

##### 5.1.3 CV-JD Matching Prompt
```
You are an expert recruitment AI specializing in CV-to-job matching. Your task is to analyze both the CV and job description, then generate a tailored CV that maximizes the candidate's fit for the specific position.

**Matching Strategy:**
1. Identify key requirements from the job description
2. Map candidate's experience to job requirements
3. Highlight relevant achievements and skills
4. Emphasize transferable skills
5. Address potential gaps proactively
6. Optimize language and terminology
7. Ensure ATS compatibility

**Embellishment Level: {level} (1-5)**
- Level 1: Conservative, focus on direct matches
- Level 2: Moderate, emphasize relevant experience
- Level 3: Balanced, highlight strengths appropriately
- Level 4: Assertive, emphasize potential and capabilities
- Level 5: Confident, maximize presentation of fit

**Input CV:**
{optimized_cv_text}

**Job Description Analysis:**
{job_analysis}

**User Profile:**
{profile_data}

**Output Format:**
Generate a tailored CV that maximizes fit for the specific job while maintaining accuracy and professionalism.

**Response Structure:**
{
  "tailored_cv": "tailored CV content",
  "match_analysis": {
    "overall_match_score": 0.85,
    "key_matches": [
      {
        "requirement": "job requirement",
        "candidate_fit": "how candidate meets requirement",
        "confidence": 0.90
      }
    ],
    "gaps_identified": [
      {
        "gap": "identified gap",
        "mitigation": "how gap is addressed"
      }
    ]
  },
  "optimization_notes": {
    "sections_enhanced": ["experience", "skills"],
    "keywords_added": ["keyword1", "keyword2"],
    "achievements_highlighted": ["achievement1", "achievement2"]
  }
}
```

##### 5.1.4 Cover Letter Generation Prompt
```
You are an expert cover letter writer. Your task is to generate a personalized cover letter that connects the candidate's experience with the specific job requirements.

**Cover Letter Guidelines:**
1. Address the specific company and role
2. Connect candidate's experience to job requirements
3. Highlight relevant achievements and skills
4. Show enthusiasm and cultural fit
5. Keep it concise and impactful
6. Use professional tone and language
7. Include call to action

**Tone: {tone} (professional/enthusiastic/formal/casual)**

**Candidate CV:**
{tailored_cv_text}

**Job Description:**
{job_description_text}

**Company Information:**
{company_data}

**Output Format:**
Generate a compelling cover letter that showcases the candidate's fit for the position.

**Response Structure:**
{
  "cover_letter": "cover letter content",
  "key_points_covered": [
    "point 1",
    "point 2",
    "point 3"
  ],
  "personalization_elements": [
    "company-specific element 1",
    "company-specific element 2"
  ]
}
```

#### 5.2 AI Integration Architecture

```typescript
// AI Service Interface
interface AIService {
  optimizeCV(cvText: string, profile: UserProfile, level: number): Promise<CVOptimizationResult>;
  analyzeJobDescription(jdText: string): Promise<JobAnalysis>;
  generateTailoredCV(cvText: string, jobAnalysis: JobAnalysis, profile: UserProfile, level: number): Promise<CVGenerationResult>;
  generateCoverLetter(cvText: string, jdText: string, companyData: any, tone: string): Promise<CoverLetterResult>;
}

// AI Service Implementation
class OpenAIService implements AIService {
  private client: OpenAI;
  
  async optimizeCV(cvText: string, profile: UserProfile, level: number): Promise<CVOptimizationResult> {
    const prompt = this.buildCVOptimizationPrompt(cvText, profile, level);
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });
    
    return this.parseCVOptimizationResponse(response.choices[0].message.content);
  }
  
  // Other AI methods...
}
```

### 6. File Processing

#### 6.1 CV File Processing

```typescript
// File Processing Service
class FileProcessingService {
  async processCV(file: Express.Multer.File): Promise<CVProcessingResult> {
    const extractedText = await this.extractTextFromFile(file);
    const parsedCV = await this.parseCVStructure(extractedText);
    const validatedCV = this.validateCVContent(parsedCV);
    
    return {
      extractedText,
      parsedCV,
      validatedCV,
      processingMetadata: {
        fileSize: file.size,
        fileType: file.mimetype,
        processingTime: Date.now(),
        confidence: validatedCV.confidence
      }
    };
  }
  
  private async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    switch (file.mimetype) {
      // PDF not supported in MVP
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await this.extractDocxText(file);
      case 'application/msword':
        return await this.extractDocText(file);
      case 'text/plain':
        return file.buffer.toString('utf-8');
      default:
        throw new Error('Unsupported file type');
    }
  }
  
  // PDF extraction removed for MVP
  
  private async extractDocxText(file: Express.Multer.File): Promise<string> {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }
}
```

#### 6.2 Web Scraping Service

```typescript
// Web Scraping Service
class WebScrapingService {
  async scrapeJobDescription(url: string): Promise<JobScrapingResult> {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      const content = await page.evaluate(() => {
        return {
          title: document.querySelector('h1')?.textContent || '',
          company: document.querySelector('[data-company]')?.textContent || '',
          description: document.querySelector('[data-description]')?.textContent || '',
          requirements: document.querySelector('[data-requirements]')?.textContent || '',
          location: document.querySelector('[data-location]')?.textContent || ''
        };
      });
      
      return {
        url,
        title: content.title,
        company: content.company,
        description: content.description,
        requirements: content.requirements,
        location: content.location,
        scrapedAt: new Date().toISOString()
      };
    } finally {
      await browser.close();
    }
  }
}
```

### 7. Processing Model (MVP)

- Generation runs synchronously per JD within API requests (sequential loop; show progress in UI)
- If needed later: Supabase Edge Functions + QStash for background jobs

### 7. Queue System

#### 7.1 Bull Queue Configuration

```typescript
// Queue Configuration
const queueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

// Queue Definitions
const cvOptimizationQueue = new BullQueue('cv-optimization', queueConfig);
const jdExtractionQueue = new BullQueue('jd-extraction', queueConfig);
const cvGenerationQueue = new BullQueue('cv-generation', queueConfig);
const coverLetterQueue = new BullQueue('cover-letter', queueConfig);

// Queue Processors
cvOptimizationQueue.process('optimize', async (job) => {
  const { cvId, userId, embellishmentLevel } = job.data;
  return await cvOptimizationProcessor.process(cvId, userId, embellishmentLevel);
});

jdExtractionQueue.process('extract', async (job) => {
  const { jdId, userId } = job.data;
  return await jdExtractionProcessor.process(jdId, userId);
});
```

### 8. Security Implementation (MVP)

#### 8.1 Authentication Middleware

```typescript
// JWT Authentication Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Rate Limiting Middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
```

#### 8.2 Data Validation

```typescript
// Zod Schemas for Validation
const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
});

const cvUploadSchema = z.object({
  file: z.object({
    mimetype: z.enum(['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']),
    size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  }),
});

const jobDescriptionSchema = z.object({
  items: z.array(z.object({
    title: z.string().optional(),
    company: z.string().optional(),
    text: z.string().min(50, 'Please paste a full job description')
  })).max(5, 'Maximum 5 job descriptions allowed in MVP'),
});
```

### 9. Error Handling

#### 9.1 Error Types

```typescript
// Custom Error Classes
class ApplicationError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 400);
  }
}

class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

class NotFoundError extends ApplicationError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

class RateLimitError extends ApplicationError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
  }
}
```

#### 9.2 Error Handling Middleware

```typescript
// Global Error Handler
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  
  if (err instanceof ApplicationError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.message,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Default error response
  return res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
    timestamp: new Date().toISOString(),
  });
};
```

### 10. Performance Optimization

#### 10.1 Caching Strategy

```typescript
// Redis Cache Service
class CacheService {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

#### 10.2 Database Optimization

```typescript
// Prisma Middleware for Query Optimization
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// Query optimization middleware
prisma.$use(async (params, next) => {
  // Add query timeout
  const startTime = Date.now();
  
  try {
    const result = await next(params);
    
    // Log slow queries
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        duration,
        model: params.model,
        action: params.action,
        args: params.args,
      });
    }
    
    return result;
  } catch (error) {
    logger.error('Database query failed', {
      error: error.message,
      model: params.model,
      action: params.action,
      args: params.args,
    });
    throw error;
  }
});
```

### 11. Monitoring and Logging

#### 11.1 Logging Configuration

```typescript
// Winston Logger Configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cv-optimizer-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Request Logging Middleware
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  });
  
  next();
};
```

#### 11.2 Metrics Collection

```typescript
// Prometheus Metrics
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ timeout: 5000 });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const aiApiCalls = new client.Counter({
  name: 'ai_api_calls_total',
  help: 'Total number of AI API calls',
  labelNames: ['provider', 'model', 'endpoint'],
});

const processingJobs = new client.Gauge({
  name: 'processing_jobs_total',
  help: 'Total number of processing jobs',
  labelNames: ['status', 'job_type'],
});

// Metrics middleware
const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const end = httpRequestDuration.startTimer();
  
  res.on('finish', () => {
    end({
      route: req.route?.path || req.path,
      method: req.method,
      status_code: res.statusCode,
    });
  });
  
  next();
};
```

### 12. Deployment Configuration (MVP)

#### 12.1 Hosting
- App: Vercel (Next.js)
- Backend: Supabase (Auth, Postgres, Storage), region: EU (Frankfurt) recommended for GDPR default

#### 12.2 Environment Variables
- NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE (server-only)
- OPENAI_API_KEY
- UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (rate limiting)
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (post-MVP if payments enabled)

#### 12.3 Storage
- Supabase Storage bucket: `cv-uploads` (DOCX/TXT only); RLS storage policies per user

#### Optional: Docker Configuration (Phase 2)

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
USER nextjs

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Optional: Docker Compose (Phase 2)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/cv_optimizer
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
      - OPENAI_API_KEY=your-openai-key
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=cv_optimizer
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

---

**Version**: 1.1  
**Date**: 2025-09-08  
**Status**: Solo MVP  
**Next Review**: After beta feedback
