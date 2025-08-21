import { Scale, BookOpen, Users, Mail, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-hero-gradient overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Brand Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-light to-gold-dark rounded-2xl flex items-center justify-center shadow-gold transform transition-transform hover:scale-105">
                  <Scale className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary-foreground">Rizzourse</h3>
                  <p className="text-lg text-primary-foreground/80 font-medium">Legal Mentorship</p>
                </div>
              </div>
              
              <p className="text-primary-foreground/80 leading-relaxed text-lg max-w-md">
                Connecting law students with experienced mentors 
                and building a supportive community for legal career success.
              </p>
            </div>
            
            {/* Social Icons */}
            <div className="flex space-x-4">
              <div className="group w-12 h-12 bg-primary-foreground/10 hover:bg-gold-light/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-gold cursor-pointer">
                <BookOpen className="w-5 h-5 text-primary-foreground group-hover:text-gold-light transition-colors" />
              </div>
              <div className="group w-12 h-12 bg-primary-foreground/10 hover:bg-gold-light/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-gold cursor-pointer">
                <Users className="w-5 h-5 text-primary-foreground group-hover:text-gold-light transition-colors" />
              </div>
              <div className="group w-12 h-12 bg-primary-foreground/10 hover:bg-gold-light/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-gold cursor-pointer">
                <Mail className="w-5 h-5 text-primary-foreground group-hover:text-gold-light transition-colors" />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="lg:text-right">
            <div className="inline-block p-8 bg-primary-foreground/5 backdrop-blur-sm rounded-3xl border border-primary-foreground/10 shadow-green">
              <h4 className="text-2xl font-bold text-primary-foreground mb-6">Get In Touch</h4>
              <div className="group flex items-center justify-center lg:justify-end space-x-4 p-4 bg-primary-foreground/10 rounded-2xl hover:bg-gold-light/20 transition-all duration-300 hover:shadow-gold">
                <Mail className="w-6 h-6 text-gold-light" />
                <a
                  href="mailto:rana.sher.khan@emory.edu"
                  className="text-primary-foreground hover:text-gold-light transition-colors text-lg font-medium"
                >
                  rana.sher.khan@emory.edu
                </a>
                <ArrowRight className="w-5 h-5 text-gold-light group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Line */}
        <div className="mt-16 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent" />
        </div>

        {/* Bottom Section */}
        <div className="text-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 Rizzourse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;