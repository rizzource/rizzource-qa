import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-hero-gradient overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 mobile-optimized py-20 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-8">
          
          {/* Name and Catchphrase */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              LawPathfinder
            </h1>
            
            <p className="text-xl sm:text-2xl lg:text-3xl text-gold-light font-medium leading-relaxed max-w-3xl mx-auto">
              Your Complete Legal Research Companion
            </p>
          </div>

          {/* APALSA Mentorship Program Button */}
          <div className="pt-4">
            <Button
              size="lg"
              className="bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 shadow-gold text-lg px-8 h-16 touch-target touch-friendly"
            >
              APALSA Mentorship Program
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;