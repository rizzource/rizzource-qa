import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BookOpen, Award } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 bg-hero-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Main CTA Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                Ready to Excel in
                <span className="block text-gold-light">Your Legal Studies?</span>
              </h2>
              
              <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Join thousands of law students who are already using LawPathfinder 
                to achieve academic success and prepare for their legal careers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 shadow-gold text-lg px-8 py-6"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-primary transition-all duration-300 text-lg px-8 py-6"
              >
                Schedule Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="grid sm:grid-cols-3 gap-8 pt-12 border-t border-white/20">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-gold-light" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">5,000+</div>
                <div className="text-white/80 text-sm">Active Students</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-gold-light" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">10,000+</div>
                <div className="text-white/80 text-sm">Legal Resources</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-gold-light" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">94%</div>
                <div className="text-white/80 text-sm">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;