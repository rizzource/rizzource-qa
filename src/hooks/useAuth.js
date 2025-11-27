import { useSelector } from "react-redux";

const useAuth = () => {
    const { user, token, roles, loading } = useSelector((state) => state.userApi);

    const isSuperAdmin = () => {
        return roles?.includes("SuperAdmin");
    };

    const hasRole = (requiredRole) => {
        if (!requiredRole) return true;
        return roles?.includes(requiredRole);
    };

    return {
        user,
        token,
        roles,
        loading,
        isSuperAdmin,
        hasRole
    };
};

export default useAuth;
