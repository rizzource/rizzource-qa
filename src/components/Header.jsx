import { useState } from 'react'; 
import { Button } from "@/components/ui/button"; 
import { Scale, Shield, LogOut, User, ArrowLeft } from "lucide-react"; 
import { useAuth } from './AuthProvider';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 

const Header = () => { 
  const { user, userProfile, isAdmin, signOut } = useAuth(); 
  const navigate = useNavigate(); 
  const location = useLocation(); 
  // Get current path 
  const handleSignOut = async () => { 
    await signOut(); 
    navigate('/dashboard'); 
  };
  console.log("UserProfileData", userProfile)
  return ( 
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"> 
      <div className="container mx-auto mobile-optimized"> 
        <div className="flex items-center justify-between h-14 sm:h-16"> 
          {/* Logo */} 
          <a href="/" className="flex items-center space-x-2 sm:space-x-3 touch-friendly flex-1 sm:flex-initial"> 
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0"> 
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" /> 
            </div> 
            <div className="flex-1 sm:block"> 
              <h1 className="text-base sm:text-lg md:text-xl leading-tight text-primary font-bold"> 
                <span className="text-accent">RIZZ</span> 
                <span>ource</span> 
              </h1> 
              <p className="text-xs hidden sm:block text-muted-foreground">Law School and Beyond</p> 
            </div> 
          </a> 
          {/* Right-hand controls */} 
          <div className="flex items-center gap-2 sm:gap-4"> 
            {location.pathname === "/auth" ? ( 
              // Show Back to Home Button on Auth Page 
              <Link to="/" className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:text-primary hover:border-primary transition-colors" > 
                <ArrowLeft className="h-4 w-4 mr-1" /> 
                <span className="hidden sm:inline">Back to Home</span> 
              </Link> 
            ) : location.pathname === "/admin" ? ( 
              // Show Back to Home + Sign Out on Dashboard 
              <> 
                <Link to="/" className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:text-primary hover:border-primary transition-colors" > 
                  <ArrowLeft className="h-4 w-4 mr-1" /> 
                  <span className="hidden sm:inline">Back to Home</span> 
                </Link> 
              </> 
            ) : null} 
            {/* Resource Hub only visible for Mentors */}
            { user?.user_metadata?.role === 'mentor' && (
              <Link to="/resources" className="font-bold text-primary hover:text-accent transition-colors" > Resource Hub </Link>
            )}
            {user ? 
            ( 
              <> 
                <span className="text-xs sm:text-sm text-muted-foreground"> 
                  {isAdmin() ? 'Admin' :  user?.user_metadata?.role === 'mentor' ? "Mentor" : "Mentee"} 
                </span> 
                {isAdmin() && 
                  ( 
                    <Link to="/admin" className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border border-border text-foreground hover:text-primary hover:border-primary transition-colors" > 
                      <span className="hidden sm:inline">Dashboard</span> 
                      <Shield className="h-4 w-4 sm:hidden" /> 
                    </Link> 
                  )
                } 
                <Link to="#" onClick={(e) => 
                { 
                  e.preventDefault(); 
                  handleSignOut(); 
                }
                } 
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors" > 
                  <LogOut className="h-4 w-4 mr-1" /> 
                  <span className="hidden sm:inline">Sign Out</span> 
                </Link> 
              </> 
            ) : ( 
              <Link to="/auth" className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:text-primary hover:border-primary transition-colors" > 
                <User className="h-4 w-4 mr-1" /> 
                <span className="hidden sm:inline">Sign In</span> 
              </Link> 
            )
            } 
          </div> 
        </div> 
      </div> 
    </header> 
  ); 
}; 
                                                                                                                                                                                                                                                                                              
export default Header;