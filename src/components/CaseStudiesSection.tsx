import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, TrendingUp, ArrowRight } from "lucide-react";

const featuredCases = [
  {
    title: "Brown v. Board of Education",
    year: "1954",
    area: "Constitutional Law",
    impact: "Landmark",
    description: "Supreme Court decision that declared racial segregation in public schools unconstitutional, overturning Plessy v. Ferguson.",
    insights: "Key precedent for civil rights law and equal protection analysis.",
    students: 1250
  },
  {
    title: "Miranda v. Arizona", 
    year: "1966",
    area: "Criminal Law",
    impact: "Foundational",
    description: "Established the requirement for police to inform suspects of their rights before interrogation.",
    insights: "Essential for understanding Fifth Amendment protections and criminal procedure.",
    students: 980
  },
  {
    title: "Marbury v. Madison",
    year: "1803", 
    area: "Constitutional Law",
    impact: "Historic",
    description: "Established the principle of judicial review, giving courts the power to declare laws unconstitutional.",
    insights: "Fundamental to understanding separation of powers and judicial authority.",
    students: 1100
  }
];

const CaseStudiesSection = () => {
  return (
    <section id="cases" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Landmark
            <span className="text-primary block">Case Studies</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Dive deep into the most influential legal cases that shaped modern law 
            with detailed analysis and practical applications.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {featuredCases.map((case_study, index) => (
            <Card key={index} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {case_study.area}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="border-gold-primary/30 text-gold-dark"
                  >
                    {case_study.impact}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {case_study.title}
                </h3>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{case_study.year}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{case_study.students} studying</span>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {case_study.description}
                </p>

                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Key Insight:</span> {case_study.insights}
                    </p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Study This Case
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            View All Case Studies
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;