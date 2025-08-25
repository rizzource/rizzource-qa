import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

const MinimalistHome = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* RIZZource Logo */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-lg flex items-center justify-center">
            <Scale className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl">
            <span className="text-gold-rizz font-bold">RIZZ</span>
            <span className="text-primary font-semibold">ource</span>
          </h1>
        </div>
        
        {/* Coming Soon Text */}
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">
          Coming Soon...
        </h2>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl">
          The ultimate resource platform for law students and legal professionals
        </p>
        
        {/* Link to APALSA Mentorship */}
        <Link to="/apalsa-mentorship">
          <Button 
            size="lg"
            className="bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 shadow-gold text-base sm:text-lg px-8 py-4 rounded-xl"
          >
            APALSA Mentorship Program
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MinimalistHome;