import { Shield, BookOpen, Users, Mail } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "About Rizzourse", href: "#about" },
    { name: "Mentorship Program", href: "#mentorship" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Success Stories", href: "#stories" },
  ];

  const resources = [
    { name: "Mentor Guidelines", href: "#mentor-guide" },
    { name: "Mentee Resources", href: "#mentee-resources" },
    { name: "Events & Workshops", href: "#events" },
    { name: "Network Directory", href: "#directory" },
  ];

  const support = [
    { name: "Program FAQ", href: "#faq" },
    { name: "Contact Support", href: "#support" },
    { name: "Get Help", href: "#help" },
    { name: "Join Community", href: "#community" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gold-light rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Rizzourse</h3>
                <p className="text-sm text-primary-foreground/80">Legal Mentorship</p>
              </div>
            </div>
            
            <p className="text-primary-foreground/80 leading-relaxed">
              Connecting law students with experienced mentors 
              and building a supportive community for legal career success.
            </p>
            
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-gold-light transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-gold-light transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-gold-light transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-primary-foreground/60 text-sm">
              © 2024 Rizzourse. All rights reserved.
            </p>
            
            <div className="flex space-x-6 text-sm">
              <a href="#privacy" className="text-primary-foreground/60 hover:text-gold-light transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-primary-foreground/60 hover:text-gold-light transition-colors">
                Terms of Service
              </a>
              <a href="#accessibility" className="text-primary-foreground/60 hover:text-gold-light transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;