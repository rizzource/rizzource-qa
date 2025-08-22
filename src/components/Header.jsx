import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import MobileNavigation from "./MobileNavigation";

const Header = () => {
  const navigation = [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 mobile-optimized">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 touch-friendly">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-primary">Rizzourse</h1>
              <p className="text-xs text-muted-foreground">Legal Mentorship</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium text-sm lg:text-base"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
};

export default Header;