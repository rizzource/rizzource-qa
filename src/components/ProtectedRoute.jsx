import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const ProtectedRoute = ({ children, requireSuperAdmin = false, requireRole = null }) => {
  const navigate = useNavigate();
  const { user, roles, loading, isSuperAdmin, hasRole } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
        return;
      }

      if (requireSuperAdmin) {
        if (!isSuperAdmin()) {
          navigate("/");
        }
      }

      if (requireRole && !hasRole(requireRole)) {
        navigate("/");
      }
    }
  }, [loading, user, roles, requireSuperAdmin, requireRole, isSuperAdmin, hasRole, navigate]);

  // Show loading while verifying
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin()) return null;
  if (requireRole && !hasRole(requireRole)) return null;

  return children;
};

export default ProtectedRoute;
