-- Create role enum
CREATE TYPE public.app_role AS ENUM ('superadmin', 'owner', 'hr', 'admin', 'applicant', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'superadmin');
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can manage all roles"
ON public.user_roles FOR ALL
USING (public.is_superadmin());

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create company_members table
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL CHECK (role IN ('owner', 'hr', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (company_id, user_id)
);

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  job_type TEXT,
  salary_range TEXT,
  application_deadline DATE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (job_id, applicant_id)
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is company member
CREATE OR REPLACE FUNCTION public.is_company_member(_company_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = _company_id AND user_id = _user_id
  )
$$;

-- Helper function to get user's company from job
CREATE OR REPLACE FUNCTION public.get_job_company_id(_job_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.jobs WHERE id = _job_id
$$;

-- RLS Policies for companies
CREATE POLICY "Anyone can view companies"
ON public.companies FOR SELECT
USING (true);

CREATE POLICY "Superadmins can manage companies"
ON public.companies FOR ALL
USING (public.is_superadmin());

CREATE POLICY "Owners can update their companies"
ON public.companies FOR UPDATE
USING (auth.uid() = owner_id);

-- RLS Policies for company_members
CREATE POLICY "Company members can view their team"
ON public.company_members FOR SELECT
USING (public.is_company_member(company_id, auth.uid()) OR public.is_superadmin());

CREATE POLICY "Owners can manage their team"
ON public.company_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = company_id AND owner_id = auth.uid()
  )
);

-- RLS Policies for jobs
CREATE POLICY "Anyone can view open jobs"
ON public.jobs FOR SELECT
USING (status = 'open' OR public.is_company_member(company_id, auth.uid()) OR public.is_superadmin());

CREATE POLICY "Company HR/Admin can create jobs"
ON public.jobs FOR INSERT
WITH CHECK (
  public.is_company_member(company_id, auth.uid()) AND
  (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
);

CREATE POLICY "Company HR/Admin can update their jobs"
ON public.jobs FOR UPDATE
USING (
  public.is_company_member(company_id, auth.uid()) AND
  (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
);

CREATE POLICY "Company owners can delete their jobs"
ON public.jobs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = company_id AND owner_id = auth.uid()
  )
);

-- RLS Policies for job_applications
CREATE POLICY "Applicants can view their own applications"
ON public.job_applications FOR SELECT
USING (auth.uid() = applicant_id);

CREATE POLICY "Company members can view applications for their jobs"
ON public.job_applications FOR SELECT
USING (
  public.is_company_member(public.get_job_company_id(job_id), auth.uid())
);

CREATE POLICY "Authenticated users can create applications"
ON public.job_applications FOR INSERT
WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Company HR/Admin can update application status"
ON public.job_applications FOR UPDATE
USING (
  public.is_company_member(public.get_job_company_id(job_id), auth.uid()) AND
  (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
);

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing admin users to superadmin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;