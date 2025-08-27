import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Scale, Shield, LogOut, User } from "lucide-react";
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';

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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAdminAccess}
                      className="hidden sm:flex"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  <User className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;