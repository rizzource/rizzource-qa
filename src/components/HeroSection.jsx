import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Zap, Scale } from "lucide-react";
import heroImage from "@/assets/hero-legal-illustration.jpg";

const HeroSection = ({ onStartProgram }) => {
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
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight pt-8">
                APALSA's
                <span className="block text-gold-light">Mentorship Program</span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto">
Learn from APALSA mentors who have excelled academically, secured internships, and are eager to share insights to help you thrive in Law School and Beyond.              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={onStartProgram}
                className="bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 shadow-gold text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 touch-target touch-friendly whitespace-nowrap flex items-center rounded-xl"
              >
                APALSA Mentorship Program
                <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
              </Button>
            </div>
          </div>

          {/* Image Section - Now below the text */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="APALSA mentorship program community"
                className="w-full h-auto rounded-2xl shadow-green"
                loading="eager"
              />
            </div>
            
            {/* Decorative glow effect */}
            <div className="absolute inset-0 bg-gold-light/10 rounded-2xl blur-xl transform scale-110"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;