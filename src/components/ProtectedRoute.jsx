import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, userProfile, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (requireAdmin && !isAdmin()) {
        navigate('/');
        return;
      }
    }
  }, [user, userProfile, loading, requireAdmin, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && !isAdmin()) {
    return null;
  }

  return children;
};

export default ProtectedRoute;