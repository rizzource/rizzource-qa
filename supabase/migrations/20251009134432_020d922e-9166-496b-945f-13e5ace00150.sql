-- Add INSERT policy for superadmins to create companies
CREATE POLICY "Superadmins can insert companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (is_superadmin());