import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, Users } from "lucide-react";

const MentorMenteeSelection = ({ onSelectType, onBack }) => {
  return (
    <section className="min-h-screen bg-hero-gradient flex items-center py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Join APALSA Mentorship Program
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Choose your role in our mentorship community
            </p>
          </div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                  onClick={() => onSelectType('mentor')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gold-light/20 rounded-full w-fit group-hover:bg-gold-light/30 transition-colors">
                  <GraduationCap className="h-12 w-12 text-gold-light" />
                </div>
                <CardTitle className="text-2xl text-white">Become a Mentor</CardTitle>
                <CardDescription className="text-white/80 text-base">
                  Share your experience and guide aspiring legal professionals
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-white/90 space-y-2 mb-6">
                  <li>• Guide law students and junior lawyers</li>
                  <li>• Share career insights and advice</li>
                  <li>• Build meaningful professional relationships</li>
                  <li>• Give back to the legal community</li>
                </ul>
                <Button 
                  size="lg"
                  className="bg-gold-light text-primary hover:bg-gold-dark rounded-xl px-8 py-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectType('mentor');
                  }}
                >
                  Join as Mentor
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                  onClick={() => onSelectType('mentee')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gold-light/20 rounded-full w-fit group-hover:bg-gold-light/30 transition-colors">
                  <Users className="h-12 w-12 text-gold-light" />
                </div>
                <CardTitle className="text-2xl text-white">Become a Mentee</CardTitle>
                <CardDescription className="text-white/80 text-base">
                  Learn from experienced professionals and accelerate your career
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-white/90 space-y-2 mb-6">
                  <li>• Get personalized career guidance</li>
                  <li>• Learn from experienced professionals</li>
                  <li>• Expand your professional network</li>
                  <li>• Accelerate your career growth</li>
                </ul>
                <Button 
                  size="lg"
                  className="bg-gold-light text-primary hover:bg-gold-dark rounded-xl px-8 py-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectType('mentee');
                  }}
                >
                  Join as Mentee
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorMenteeSelection;