-- Allow admins to create and manage companies and company members
BEGIN;

-- 1) Admins can INSERT into companies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Admins can insert companies'
  ) THEN
    CREATE POLICY "Admins can insert companies"
    ON public.companies
    FOR INSERT
    WITH CHECK (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.is_admin()
    );
  END IF;
END
$$;

-- 2) Admins can manage companies (SELECT/UPDATE/DELETE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Admins can manage companies'
  ) THEN
    CREATE POLICY "Admins can manage companies"
    ON public.companies
    FOR ALL
    USING (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.is_admin()
    );
  END IF;
END
$$;

-- 3) Admins can manage company members (needed right after company creation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'company_members' AND policyname = 'Admins can manage company members'
  ) THEN
    CREATE POLICY "Admins can manage company members"
    ON public.company_members
    FOR ALL
    USING (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.is_admin()
    )
    WITH CHECK (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.is_admin()
    );
  END IF;
END
$$;

COMMIT;