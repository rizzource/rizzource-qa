import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
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
              <Scale className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-primary">LawPathfinder</h1>
              <p className="text-xs text-muted-foreground">Student Hub</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a
              href="/"
              className="text-foreground hover:text-primary transition-colors font-medium text-sm lg:text-base"
            >
              Home
            </a>
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium text-sm lg:text-base"
              >
                {item.name}
              </a>
            ))}
            <a
              href="/resources"
              className="text-foreground hover:text-primary transition-colors font-medium text-sm lg:text-base"
            >
              Library
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
              Sign In
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started
            </Button>
          </div>

          {/* Mobile Navigation */}
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
};

export default Header;