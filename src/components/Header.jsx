import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

const Header = () => {
  const navigation = [];

  return (
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
                 <img
        src="https://ixwnucfebopjqcokohhw.supabase.co/storage/v1/object/public/assets/5d1a12c4-4885-4103-a5d7-5656fab8f278.png"
        alt="Logo"
        className="h-10"
      />
                <span className="font-bold text-gold" style={{fontWeight: 700, color: "#FFD900"}}>RIZZ</span>
                <span className="font-semibold text-primary" style={{fontWeight: 600}}>ource</span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Law School and Beyond</p>
            </div>
          </a>

          {/* Desktop Navigation - Hidden on mobile */}
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
        </div>
      </div>
    </header>
  );
};

export default Header;