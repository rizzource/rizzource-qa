import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText, Scale, GraduationCap, ArrowRight } from "lucide-react";

const featuredResources = [
  {
    icon: Scale,
    title: "Constitutional Law Database",
    description: "Comprehensive collection of Supreme Court cases and constitutional analysis",
    count: "2,500+ Cases",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: FileText,
    title: "Legal Writing Templates",
    description: "Professional templates for briefs, memos, and legal documents",
    count: "150+ Templates",
    color: "bg-gold-primary/10 text-gold-dark"
  },
  {
    icon: BookOpen,
    title: "Bar Exam Prep Materials",
    description: "Complete study guides and practice questions for all bar exam subjects",
    count: "5,000+ Questions",
    color: "bg-secondary/10 text-secondary"
  },
  {
    icon: GraduationCap,
    title: "Law School Outlines",
    description: "Detailed course outlines for all major law school subjects",
    count: "200+ Outlines",
    color: "bg-accent/10 text-accent-foreground"
  }
];

const ResourcesSection = () => {
  return (
    <section id="resources" className="py-20 bg-neutral-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Featured
            <span className="text-primary block">Legal Resources</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access our carefully curated collection of legal materials, 
            from landmark cases to practical study guides.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredResources.map((resource, index) => (
            <Card key={index} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-2xl ${resource.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <resource.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {resource.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                  {resource.description}
                </p>
                <div className="text-sm font-medium text-primary">
                  {resource.count}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            asChild
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-green"
          >
            <a href="/resources">
              Explore All Resources
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;