import { Button } from "@/components/ui/button";
import { useState } from "react";
import MobileNavigation from "./MobileNavigation";

const Header = () => {
  const navigation = [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 mobile-optimized">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <a href="/" className="flex items-center touch-friendly">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/lovable-uploads/a804b6c9-a739-499a-b08e-179235e98c06.png" alt="Rizzourse logo - shield, scales and book" className="w-8 h-8 md:w-10 md:h-10 object-contain object-center logo-white" decoding="async" loading="eager" />
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