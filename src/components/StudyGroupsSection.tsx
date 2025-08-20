import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Calendar, Star, ArrowRight } from "lucide-react";

const studyGroups = [
  {
    title: "Constitutional Law Study Circle",
    members: 24,
    level: "Advanced",
    nextMeeting: "Tomorrow, 7:00 PM",
    description: "Deep dive into constitutional principles and landmark Supreme Court cases with guided discussions.",
    tags: ["Constitutional Law", "Supreme Court", "Discussion"],
    rating: 4.9,
    isActive: true
  },
  {
    title: "Bar Exam Prep Warriors",
    members: 67,
    level: "All Levels",
    nextMeeting: "Friday, 6:00 PM", 
    description: "Collaborative preparation for the bar exam with practice questions and peer support.",
    tags: ["Bar Exam", "Practice Tests", "Peer Support"],
    rating: 4.8,
    isActive: true
  },
  {
    title: "Legal Writing Workshop",
    members: 18,
    level: "Beginner",
    nextMeeting: "Sunday, 3:00 PM",
    description: "Improve your legal writing skills through peer review and expert feedback.",
    tags: ["Legal Writing", "Peer Review", "Skills"],
    rating: 4.7,
    isActive: false
  }
];

const features = [
  {
    icon: Users,
    title: "Collaborative Learning",
    description: "Study with peers who share your academic goals and challenges"
  },
  {
    icon: MessageCircle,
    title: "Expert Moderation",
    description: "Groups led by experienced legal professionals and top students"
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling", 
    description: "Multiple meeting times to fit your busy law school schedule"
  },
  {
    icon: Star,
    title: "Proven Results",
    description: "94% of participants report improved exam performance"
  }
];

const StudyGroupsSection = () => {
  return (
    <section id="groups" className="py-20 bg-neutral-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Join Active
            <span className="text-primary block">Study Groups</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with fellow law students for collaborative learning, 
            peer support, and shared academic success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Active Study Groups */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Featured Study Groups
          </h3>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {studyGroups.map((group, index) => (
              <Card key={index} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge 
                      variant={group.isActive ? "default" : "secondary"}
                      className={group.isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                      }
                    >
                      {group.isActive ? "Active" : "Starting Soon"}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="border-gold-primary/30 text-gold-dark"
                    >
                      {group.level}
                    </Badge>
                  </div>

                  <h4 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {group.title}
                  </h4>

                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {group.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{group.members} members</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Star className="w-4 h-4 fill-gold-primary text-gold-primary" />
                        <span>{group.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Next: {group.nextMeeting}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {group.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {group.isActive ? "Join Group" : "Get Notified"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground mr-4"
          >
            Browse All Groups
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            className="bg-gold-primary text-primary hover:bg-gold-dark shadow-gold"
          >
            Create Study Group
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StudyGroupsSection;