import { Scale, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-8">

          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Scale className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-accent">RIZZource</h3>
                <p className="text-sm text-background/80">
                  Law School and Beyond
                </p>
              </div>
            </div>

            <p className="text-background/80 leading-relaxed">
              Student-driven resource to support your journey through Law School and Beyond.  
            </p>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent">Contact</h4>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-background/80" />
              <p className="text-background/80">
                rana.sher.khan@emory.edu
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex justify-center items-center">
            <p className="text-background/60 text-sm">
              2025 RIZZource. Powered by students.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
