import { useAuth } from '@/components/AuthProvider';

export const useUserRoles = () => {
  const { userRoles, isSuperAdmin, hasRole } = useAuth();

  return {
    userRoles,
    isSuperAdmin: isSuperAdmin(),
    isOwner: hasRole('owner'),
    isHR: hasRole('hr'),
    isAdmin: hasRole('admin'),
    isApplicant: hasRole('applicant'),
    hasRole,
  };
};