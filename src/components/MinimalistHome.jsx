import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

const MinimalistHome = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-x-hidden">
      <div className="w-full px-4 py-8 sm:px-6 md:px-8 lg:px-12">
        {/* RIZZource Logo */}
        <div className="text-center w-full max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight break-words">
              <span className="text-gold-rizz font-bold" style={{color: "#FFD900"}}>RIZZ</span>
              <span className="text-primary font-semibold">ource</span>
            </h1>
          </div>
          
          {/* Coming Soon Text */}
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8 break-words">
            Coming Soon...
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-2 break-words">
            The ultimate resource platform for law students
          </p>
          
          {/* Link to APALSA Mentorship */}
          <div className="w-full max-w-sm mx-auto px-2">
            <Link to="/apalsa-mentorship" className="block">
              <Button 
                size="lg"
                className="w-full min-h-[44px] sm:min-h-[48px] md:min-h-[52px] px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base md:text-lg bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 shadow-gold rounded-xl font-medium break-words"
              >
                APALSA Mentorship Program
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalistHome;