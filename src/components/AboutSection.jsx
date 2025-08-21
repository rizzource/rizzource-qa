import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Award, Lightbulb, ArrowRight, CheckCircle } from "lucide-react";

const stats = [
  { number: "5,000+", label: "Active Students", icon: Users },
  { number: "10,000+", label: "Legal Resources", icon: Target },
  { number: "50+", label: "Universities", icon: Award },
  { number: "94%", label: "Success Rate", icon: CheckCircle }
];

const values = [
  {
    icon: Target,
    title: "Academic Excellence",
    description: "We're committed to helping law students achieve their highest academic potential through comprehensive resources and support."
  },
  {
    icon: Users,
    title: "Collaborative Learning",
    description: "Foster a community where students learn from each other, share knowledge, and grow together in their legal education."
  },
  {
    icon: Lightbulb,
    title: "Innovation in Legal Education",
    description: "Continuously evolving our platform with cutting-edge tools and methodologies to enhance legal learning experiences."
  },
  {
    icon: Award,
    title: "Professional Preparation",
    description: "Bridge the gap between law school and legal practice with real-world applications and professional development resources."
  }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        
        {/* Main About Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                About LawPathfinder
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Empowering the Next
                <span className="text-primary block">Generation of Lawyers</span>
              </h2>
            </div>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              LawPathfinder was founded by legal professionals and educators who recognized 
              the need for comprehensive, accessible resources that bridge the gap between 
              theoretical legal education and practical application.
            </p>
            
            <p className="text-muted-foreground leading-relaxed">
              Our platform combines cutting-edge technology with proven pedagogical methods 
              to create an unparalleled learning experience. From first-year law students 
              to bar exam candidates, we provide the tools, resources, and community support 
              needed to excel in legal studies and beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Learn Our Story
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Meet Our Team
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center group hover:shadow-card transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Our Core Values
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at LawPathfinder
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gold-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-primary/20 transition-colors">
                    <value.icon className="w-8 h-8 text-gold-dark" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">
                    {value.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-hero-gradient rounded-2xl p-8 lg:p-12 text-center">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Our Mission
          </h3>
          <p className="text-xl text-white/90 leading-relaxed max-w-4xl mx-auto mb-8">
            To democratize access to high-quality legal education resources and create 
            a collaborative learning environment where every law student can thrive, 
            regardless of their background or circumstances.
          </p>
          <Button 
            size="lg"
            className="bg-gold-light text-primary hover:bg-gold-dark shadow-gold"
          >
            Join Our Community
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;