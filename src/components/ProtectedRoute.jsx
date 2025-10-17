import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requireSuperAdmin = false, requireRole = null }) => {
  const { user, userRoles, loading, isSuperAdmin, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (requireSuperAdmin) {
        if (userRoles.length === 0) {
          // Wait until roles load
          return;
        }
        if (!isSuperAdmin()) {
          navigate('/');
          return;
        }
      }

      if (requireRole) {
        if (userRoles.length === 0) {
          // Wait until roles load
          return;
        }
        if (!hasRole(requireRole)) {
          navigate('/');
          return;
        }
      }
    }
  }, [user, userRoles, loading, requireSuperAdmin, requireRole, isSuperAdmin, hasRole, navigate]);

  if (loading || (requireSuperAdmin && userRoles.length === 0) || (requireRole && userRoles.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireSuperAdmin && !isSuperAdmin()) {
    return null;
  }

  if (requireRole && !hasRole(requireRole)) {
    return null;
  }

  return children;
};

export default ProtectedRoute;