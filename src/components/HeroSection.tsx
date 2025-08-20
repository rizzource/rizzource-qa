import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Zap, Scale } from "lucide-react";
import heroImage from "@/assets/hero-legal-illustration.jpg";

const HeroSection = () => {
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                Your Complete
                <span className="block text-gold-light">Legal Research</span>
                Companion
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto">
                Access comprehensive case studies, legal databases, and study materials 
                designed specifically for law students and legal professionals.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 shadow-gold text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 touch-target touch-friendly"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gold-light text-gold-light hover:bg-gold-light hover:text-primary transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 touch-target touch-friendly"
              >
                Browse Resources
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 lg:pt-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gold-light">10K+</div>
                <div className="text-white/80 text-xs sm:text-sm">Case Studies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gold-light">50+</div>
                <div className="text-white/80 text-xs sm:text-sm">Study Guides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gold-light">24/7</div>
                <div className="text-white/80 text-xs sm:text-sm">Legal Updates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gold-light">5K+</div>
                <div className="text-white/80 text-xs sm:text-sm">Active Students</div>
              </div>
            </div>
          </div>

          {/* Image Section - Now below the text */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="Legal research and study materials"
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