import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Scale, Menu, Home, BookOpen, Users, Briefcase, Info, Library } from "lucide-react";

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [];

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="touch-target touch-friendly p-2 hover:bg-gold-primary/10"
          >
            <Menu className="h-6 w-6 text-primary" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent 
          side="left" 
          className="w-80 bg-white border-r border-border p-0"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-hero-gradient">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gold-light rounded-lg flex items-center justify-center">
                  <Scale className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">APALSA</h2>
                  <p className="text-xs text-white/80">Mentorship Program</p>
                </div>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  ×
                </Button>
              </SheetClose>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-6">
              <div className="space-y-2 px-4">
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={handleNavClick}
                    className="flex items-center space-x-3 w-full p-3 rounded-lg text-foreground hover:bg-primary/5 hover:text-primary transition-colors touch-friendly"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </a>
                ))}
              </div>
            </nav>

            {/* Empty footer for spacing */}
            <div className="border-t border-border p-4">
              {/* No CTA buttons */}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;