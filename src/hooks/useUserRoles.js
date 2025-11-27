

export const useroles = () => {
  const { roles, isSuperAdmin, hasRole } = useAuth();

  return {
    roles,
    isSuperAdmin: isSuperAdmin(),
    isOwner: hasRole('owner'),
    isHR: hasRole('hr'),
    isAdmin: hasRole('admin'),
    isApplicant: hasRole('applicant'),
    hasRole,
  };
};