import { Scale, BookOpen, Users, Mail } from "lucide-react";

const Footer = () => {

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-8">

          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gold-light rounded-lg flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">RIZZource</h3>
                <p className="text-sm text-primary-foreground/80">Law School and Beyond
                </p>
              </div>
            </div>

            <p className="text-primary-foreground/80 leading-relaxed">
              Student-driven resource to support your journey through Law School and Beyond.  
            </p>

            {/* <div className="flex space-x-4">
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
            </div> */}
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-primary-foreground/80" />
              {/* <a
                href="mailto:rana.sher.khan@emory.edu"
                className="text-primary-foreground/80 hover:text-gold-light transition-colors"
              >
                rana.sher.khan@emory.edu
              </a> */}
              <p>
                rana.sher.khan@emory.edu
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex justify-center items-center">
            <p className="text-primary-foreground/60 text-sm">
              2025 RIZZource. Powered by students.
            </p>

            {/* <div className="flex space-x-6 text-sm">
              <a href="#privacy" className="text-primary-foreground/60 hover:text-gold-light transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-primary-foreground/60 hover:text-gold-light transition-colors">
                Terms of Service
              </a>
              <a href="#accessibility" className="text-primary-foreground/60 hover:text-gold-light transition-colors">
                Accessibility
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;