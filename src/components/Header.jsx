import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Scale, Shield, LogOut, User, ArrowLeft } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import logoLight from "@/assets/rizzource-logo-light.png";
import logoDark from "@/assets/rizzource-logo-dark.png";

const Header = () => {
  const { user, userProfile, userRoles, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = useLocation();
  const { theme } = useTheme();
  // Get current path
  const handleSignOut = async () => {
    await signOut();
    if (pathname === "/") {
      // Already on dashboard, force reload
      window.location.reload();
    } else {
      navigate("/");
    }
  };
  console.log("UserProfileData", userProfile);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto mobile-optimized">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 sm:space-x-3 touch-friendly flex-1 sm:flex-initial">
            <img 
              src={theme === "dark" ? logoDark : logoLight} 
              alt="RIZZource" 
              className="h-8 sm:h-10 w-auto"
            />
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">Law School and Beyond</p>
            </div>
          </a>
          {/* Right-hand controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* <ThemeToggle /> */}
            {location.pathname === "/auth" ? (
              // Show Back to Home Button on Auth Page
              <Link
                to="/"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            ) : location.pathname === "/admin" ? (
              // Show Back to Home + Sign Out on Dashboard
              <>
                <Link
                  to="/"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Back to Home</span>
                </Link>
              </>
            ) : null}

            {userProfile?.role === "mentor" && (
              <Link to="/resources" className="font-bold text-primary hover:text-accent transition-colors">
                Resource Hub
              </Link>
            )}
            {(userRoles.includes('owner') || userRoles.includes('hr') || userRoles.includes('admin')) && (
              <Link to="/company-dashboard" className="font-bold text-primary hover:text-accent transition-colors">
                Company
              </Link>
            )}
            <Link to="/jobs" className="font-bold text-primary hover:text-accent transition-colors">
              Jobs
            </Link>
            {user && !isSuperAdmin() && !userRoles.includes('owner') && !userRoles.includes('hr') && !userRoles.includes('admin') && (
              <Link to="/my-applications" className="font-bold text-primary hover:text-accent transition-colors">
                My Applications
              </Link>
            )}
            {user ? (
              <>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {isSuperAdmin() ? "Super Admin" : userRoles.includes('owner') ? "Owner" : userRoles.includes('hr') ? "HR" : userRoles.includes('admin') ? "Admin" : userRoles.includes('employee') ? "Employee" : userProfile?.role === "mentor" ? "Mentor" : userProfile?.role === "mentee" ? "Mentee" : "User"}
                </span>
                {isSuperAdmin() && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
                  >
                    <span className="hidden sm:inline">Dashboard</span>
                    <Shield className="h-4 w-4 sm:hidden" />
                  </Link>
                )}
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSignOut();
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Link>
              </>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
