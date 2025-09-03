import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Scale, Shield, LogOut, User, ArrowLeft } from "lucide-react";
import { useAuth } from './AuthProvider';
import { Link, useLocation, useNavigate } from 'react-router-dom';


const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Get current path

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className={location.pathname === "/admin" 
      ? "fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-800/70 to-emerald-700/70 backdrop-blur-lg border-b border-white/30" 
      : "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50"
    }>
      <div className="container mx-auto mobile-optimized">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 sm:space-x-3 touch-friendly flex-1 sm:flex-initial">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Scale className={`w-5 h-5 sm:w-6 sm:h-6 ${location.pathname === "/admin" ? "text-gold-light" : "text-primary-foreground"}`} />
            </div>
            <div className="flex-1 sm:block">
              <h1 className={`text-base sm:text-lg md:text-xl leading-tight ${location.pathname === "/admin" ? "text-white" : "text-primary"}`}>
                <span className="font-bold text-gold" style={{fontWeight: 700, color: "#FFD900"}}>RIZZ</span>
                <span className={`font-semibold ${location.pathname === "/admin" ? "text-white" : "text-primary"}`} style={{fontWeight: 600}}>ource</span>
              </h1>
              <p className={`text-xs hidden sm:block ${location.pathname === "/admin" ? "text-white/70" : "text-muted-foreground"}`}>Law School and Beyond</p>
            </div>
          </a>

          {/* Authentication Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {location.pathname === "/auth" ? (
              // Show Back to Home Button on Auth Page
              <Link
                to="/"
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                  location.pathname === "/admin" 
                    ? "border-white/30 text-white hover:text-gold-light hover:border-gold-light" 
                    : "border-border/50 text-gray-700 hover:text-primary hover:border-primary"
                }`}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            ) : location.pathname === "/admin" ? (
              // Show Back to Home + Sign Out on Dashboard
              <>
                <Link
                  to="/"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-white/30 text-white hover:text-gold-light hover:border-gold-light transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Back to Home</span>
                </Link>
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSignOut();
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-300 hover:text-red-100 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Link>
              </>
            ) : user ? (
              // Default User/Admin View
              <>
                <span className={`text-xs sm:text-sm ${location.pathname === "/admin" ? "text-white/80" : "text-muted-foreground"}`}>
                  {isAdmin() ? 'Admin' : 'User'}
                </span>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border transition-colors ${
                      location.pathname === "/admin"
                        ? "border-white/30 text-white hover:text-gold-light hover:border-gold-light"
                        : "border-border/50 text-gray-700 hover:text-primary hover:border-primary"
                    }`}
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
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors ${
                    location.pathname === "/admin"
                      ? "text-red-300 hover:text-red-100"
                      : "text-red-600 hover:text-red-800"
                  }`}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Link>
              </>
            ) : (
              <Link
                to="/auth"
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                  location.pathname === "/admin"
                    ? "border-white/30 text-white hover:text-gold-light hover:border-gold-light"
                    : "border-border/50 text-gray-700 hover:text-primary hover:border-primary"
                }`}
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
