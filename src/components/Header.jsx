import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Scale, Shield, LogOut, User } from "lucide-react";
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAdminAccess = () => {
    if (user && isAdmin()) {
      navigate('/admin');
    } else if (user) {
      // User is logged in but not admin
      return;
    } else {
      navigate('/auth');
    }
  };

  const handleAuthAction = () => {
    if (user) {
      handleSignOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto mobile-optimized">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo - Responsive sizing and visibility */}
            <a href="/" className="flex items-center space-x-2 sm:space-x-3 touch-friendly flex-1 sm:flex-initial">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 sm:block">
                <h1 className="text-base sm:text-lg md:text-xl text-primary leading-tight">
                  <span className="font-bold text-gold" style={{fontWeight: 700, color: "#FFD900"}}>RIZZ</span>
                  <span className="font-semibold text-primary" style={{fontWeight: 600}}>ource</span>
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Law School and Beyond</p>
              </div>
            </a>

            {/* Authentication Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                    {isAdmin() ? 'Admin' : 'User'}
                  </span>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border/50 text-gray-700 hover:text-primary hover:border-primary transition-colors"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSignOut();
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border/50 text-gray-700 hover:text-primary hover:border-primary transition-colors"
                >
                  <User className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;