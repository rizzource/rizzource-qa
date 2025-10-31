-- Add application_url column to jobs table for external application links
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS application_url text;

-- Insert dummy jobs for testing
INSERT INTO public.jobs (
  company_id,
  title,
  description,
  location,
  job_type,
  application_deadline,
  application_url,
  status,
  created_at
)
SELECT 
  c.id,
  'Software Engineer',
  'We are seeking a talented Software Engineer to join our dynamic team. You will work on cutting-edge projects, collaborate with cross-functional teams, and contribute to building scalable applications. Strong problem-solving skills and experience with modern web technologies are essential.',
  'San Francisco, CA',
  'Full-time',
  '2025-12-31',
  'https://example.com/apply/software-engineer',
  'open',
  now()
FROM public.companies c
LIMIT 1;

INSERT INTO public.jobs (
  company_id,
  title,
  description,
  location,
  job_type,
  application_deadline,
  application_url,
  status,
  created_at
)
SELECT 
  c.id,
  'Product Manager',
  'Join our product team to drive innovation and strategy. As a Product Manager, you will define product vision, prioritize features, and work closely with engineering and design teams to deliver exceptional user experiences. 3+ years of product management experience required.',
  'Remote',
  'Full-time',
  '2025-11-30',
  'https://example.com/apply/product-manager',
  'open',
  now()
FROM public.companies c
LIMIT 1;

INSERT INTO public.jobs (
  company_id,
  title,
  description,
  location,
  job_type,
  application_deadline,
  application_url,
  status,
  created_at
)
SELECT 
  c.id,
  'UX Designer',
  'We are looking for a creative UX Designer to craft intuitive and beautiful user experiences. You will conduct user research, create wireframes and prototypes, and collaborate with product and engineering teams. A strong portfolio demonstrating user-centered design is required.',
  'New York, NY',
  'Contract',
  '2025-10-31',
  'https://example.com/apply/ux-designer',
  'open',
  now()
FROM public.companies c
LIMIT 1;