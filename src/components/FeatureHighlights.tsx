import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Search, Users, Zap, FileText, Trophy } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Comprehensive Case Studies",
    description: "Access over 10,000 real case studies and legal precedents with detailed analysis and outcomes.",
    highlight: "10K+ Cases"
  },
  {
    icon: Search,
    title: "Advanced Legal Search",
    description: "Powerful search engine designed specifically for legal research with smart filters and suggestions.",
    highlight: "AI-Powered"
  },
  {
    icon: FileText,
    title: "Interactive Study Guides",
    description: "Step-by-step study materials and quizzes tailored to your law school curriculum.",
    highlight: "50+ Guides"
  },
  {
    icon: Zap,
    title: "Real-Time Legal Updates",
    description: "Stay informed with the latest legal news, court decisions, and regulatory changes.",
    highlight: "Daily Updates"
  },
  {
    icon: Users,
    title: "Collaborative Study Groups",
    description: "Connect with fellow law students, share notes, and collaborate on difficult cases.",
    highlight: "5K+ Students"
  },
  {
    icon: Trophy,
    title: "Academic Success Tools",
    description: "Track your progress, set study goals, and prepare effectively for exams and bar prep.",
    highlight: "Success Metrics"
  }
];

const FeatureHighlights = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need for
            <span className="text-primary block">Legal Excellence</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides law students with the tools, resources, 
            and community support needed to excel in their legal studies.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-green transition-all duration-300 hover:-translate-y-2 border-border/50"
            >
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <span className="text-sm font-medium text-gold-dark bg-gold-light/10 px-3 py-1 rounded-full">
                        {feature.highlight}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;