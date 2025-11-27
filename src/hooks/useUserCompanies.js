import { useState, useEffect } from 'react';

import { useAuth } from '@/components/AuthProvider';

/**
 * Hook to fetch all companies where the user is a member
 * @returns {Object} - { companies, loading, refetch }
 */
export const useUserCompanies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    if (!user) {
      setCompanies([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_members')
        .select(`
          role,
          company_id,
          companies (
            id,
            name,
            description,
            website
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const companiesWithRoles = data?.map(item => ({
        ...item.companies,
        userRole: item.role,
      })) || [];

      setCompanies(companiesWithRoles);
    } catch (error) {
      console.error('Error fetching user companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [user]);

  return {
    companies,
    loading,
    refetch: fetchCompanies,
  };
};
