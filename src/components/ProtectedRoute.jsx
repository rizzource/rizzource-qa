import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const ProtectedRoute = ({ children, requireSuperAdmin = false, requireRole = null }) => {
  const navigate = useNavigate();
  const { user, roles, isSuperAdmin, hasRole } = useAuth();

  useEffect(() => {
    // Check authentication immediately without waiting for loading state
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
  }, [user, roles, requireSuperAdmin, requireRole, isSuperAdmin, hasRole, navigate]);

  // Show loading only if user is not yet determined (check user object, not loading state)
  if (!user) {
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
