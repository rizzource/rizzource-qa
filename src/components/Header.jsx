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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)]/95 backdrop-blur-sm border-b border-[var(--color-secondary)]">
      <div className="container mx-auto mobile-optimized">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 sm:space-x-3 touch-friendly flex-1 sm:flex-initial">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--color-secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-background)]" />
            </div>
            <div className="flex-1 sm:block">
              <h1 className="text-base sm:text-lg md:text-xl leading-tight font-bold text-[var(--color-primary)]">
                <span className="text-[var(--color-accent)]">RIZZ</span>
                <span>ource</span>
              </h1>
              <p className="text-xs hidden sm:block text-[var(--color-muted)]">Law School and Beyond</p>
            </div>
          </a>
    
          {/* Right-hand controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              to="/resources" 
              className="font-bold text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors"
            >
              Resource Hub
            </Link>
    
            {user ? (
              <>
                <span className="text-xs sm:text-sm text-[var(--color-muted)]">
                  {isAdmin() ? 'Admin' : 'User'}
                </span>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border border-[var(--color-secondary)] text-[var(--color-foreground)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
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
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[var(--color-muted)] hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Link>
              </>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-[var(--color-secondary)] text-[var(--color-foreground)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
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
