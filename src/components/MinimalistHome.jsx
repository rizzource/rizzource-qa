import { Button } from "@/components/ui/button";
import { Scale, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";

const MinimalistHome = () => {
  return (
    <section className="relative min-h-screen bg-hero-gradient overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 md:left-10 animate-float opacity-20">
          <Scale className="w-12 h-12 md:w-16 md:h-16 text-gold-light" />
        </div>
        <div className="absolute top-40 right-4 md:right-20 animate-float-delayed opacity-20">
          <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-gold-light" />
        </div>
        <div className="absolute bottom-40 left-4 md:left-20 animate-float opacity-20">
          <Users className="w-12 h-12 md:w-14 md:h-14 text-gold-light" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 mobile-optimized py-20 min-h-screen flex items-center">
        <div className="w-full space-y-12">
          {/* Content Section */}
          <div className="text-center space-y-6 lg:space-y-8">
            {/* RIZZource Logo */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <Scale className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gold-light" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight break-words">
                <span className="text-gold-light font-bold">RIZZ</span>
                <span className="text-white font-semibold">ource</span>
              </h1>
            </div>
            
            {/* Coming Soon Text */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight break-words">
                Coming Soon...
              </h2>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto break-words">
                The ultimate resource platform for law students
              </p>
            </div>
            
            {/* CTA Button */}
            <div className="flex justify-center pt-4">
              <Link to="/apalsa-mentorship" className="block">
                <Button 
                  size="lg"
                  className="bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 shadow-gold text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 touch-target touch-friendly whitespace-nowrap flex items-center rounded-xl font-medium"
                >
                  APALSA Mentorship Program
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MinimalistHome;