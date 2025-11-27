import { useState, useEffect } from 'react';

import { useAuth } from '@/components/AuthProvider';

/**
 * Hook to check user's role within a specific company
 * @param {string} companyId - The company ID to check role for
 * @returns {Object} - { role, isOwner, canManageTeam, canManageJobs, canViewApplications, loading }
 */
export const useCompanyRole = (companyId) => {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyRole = async () => {
      if (!user || !companyId) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('company_members')
          .select('role')
          .eq('company_id', companyId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setRole(data?.role || null);
      } catch (error) {
        console.error('Error fetching company role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyRole();
  }, [user, companyId]);

  return {
    role,
    isOwner: role === 'owner',
    canManageTeam: role === 'owner',
    canManageJobs: ['owner', 'hr', 'admin'].includes(role),
    canViewApplications: ['owner', 'hr', 'admin'].includes(role),
    loading,
  };
};
