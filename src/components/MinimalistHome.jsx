import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

const MinimalistHome = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-12">
      {/* RIZZource Logo */}
      <div className="text-center w-full max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Scale className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight">
            <span className="text-gold-rizz font-bold">RIZZ</span>
            <span className="text-primary font-semibold">ource</span>
          </h1>
        </div>
        
        {/* Coming Soon Text */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8">
          Coming Soon...
        </h2>
        
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
          The ultimate resource platform for law students and legal professionals
        </p>
        
        {/* Link to APALSA Mentorship */}
        <div className="w-full max-w-md mx-auto">
          <Link to="/apalsa-mentorship" className="block">
            <Button 
              size="lg"
              className="w-full min-h-[48px] sm:min-h-[52px] md:min-h-[56px] px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg md:text-xl bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 shadow-gold rounded-xl font-medium"
            >
              APALSA Mentorship Program
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MinimalistHome;