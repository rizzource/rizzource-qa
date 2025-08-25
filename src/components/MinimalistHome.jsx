import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

const MinimalistHome = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center responsive-padding">
      {/* RIZZource Logo */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-lg flex items-center justify-center">
            <Scale className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl">
            <span className="text-gold-rizz" style={{fontWeight: 700}}>RIZZ</span>
            <span className="text-primary" style={{fontWeight: 600}}>ource</span>
          </h1>
        </div>
        
        {/* Coming Soon Text */}
        <h2 className="responsive-text-2xl font-bold text-foreground mb-6 sm:mb-8 text-center">
          Coming Soon...
        </h2>
        
        <p className="responsive-text-lg text-muted-foreground mb-8 sm:mb-12 max-w-2xl text-center leading-relaxed">
          The ultimate resource platform for law students and legal professionals
        </p>
        
        {/* Link to APALSA Mentorship */}
        <Link to="/apalsa-mentorship">
          <Button 
            size="lg"
            className="mobile-button bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 shadow-gold rounded-xl w-full sm:w-auto max-w-sm"
          >
            APALSA Mentorship Program
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MinimalistHome;