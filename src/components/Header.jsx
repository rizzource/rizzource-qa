import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Scale, Shield, LogOut, User, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import logoLight from "@/assets/rizzource-logo-light.png";
import logoDark from "@/assets/rizzource-logo-dark.png";
import useAuth from "../hooks/useAuth";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/userApiSlice";

const Header = () => {
  const { user, roles, isSuperAdmin } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { theme } = useTheme();

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/auth");
  };

  const resolvedRole =
    isSuperAdmin()
      ? "Super Admin"
      : "";
  //  roles.includes("owner")
  //   ? "Owner"
  //   : roles.includes("hr")
  //     ? "HR"
  //     : roles.includes("admin")
  //       ? "Admin"
  //       : roles.includes("employee")
  //         ? "Employee"
  //         : "User";

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

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Show Back button on certain pages */}
            {pathname === "/auth" || pathname === "/admin" ? (
              <Link
                to="/"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            ) : null}

            {/* NAV LINKS */}
            {(roles.includes("owner") || roles.includes("hr") || roles.includes("admin")) && (
              <Link to="/company-dashboard" className="font-bold text-primary hover:text-accent transition-colors">
                Company
              </Link>
            )}

            <Link to="/jobs" className="font-bold text-primary hover:text-accent transition-colors">
              Explore Jobs
            </Link>
            {/* {user &&
              <Link to="/favoritejobs" className="font-bold text-primary hover:text-accent transition-colors">
                Favorite Jobs
              </Link>
            } */}
            {/* {user &&
              !isSuperAdmin() &&
              !roles.includes("owner") &&
              !roles.includes("hr") &&
              !roles.includes("admin") && (
                <Link to="/my-applications" className="font-bold text-primary hover:text-accent transition-colors">
                  My Applications
                </Link>
              )} */}

            {/* AUTH SECTION */}
            {user ? (
              <>
                <span className="text-xs sm:text-sm text-muted-foreground">{resolvedRole}</span>

                {isSuperAdmin() && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
                  >
                    <span className="hidden sm:inline">Dashboard</span>
                    <Shield className="h-4 w-4 sm:hidden" />
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
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
