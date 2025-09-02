import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ResourceHub = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <section className="min-h-screen bg-hero-gradient pt-16">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-8 text-white hover:bg-white/10 whitespace-nowrap flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Resource Hub
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Access mentorship programs and study resources to excel in your legal career
            </p>
          </div>

          {/* Resource Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* APALSA Mentorship Program Card */}
            <Card className="group hover:shadow-gold transition-all duration-300 border-2 border-transparent hover:border-gold-light/30 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center group-hover:bg-secondary-green transition-colors">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-primary">
                  APALSA Mentorship Program
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Connect with experienced legal professionals for guidance and career development
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 mb-6 text-sm text-muted-foreground">
                  <li>• One-on-one mentorship matching</li>
                  <li>• Career guidance and networking</li>
                  <li>• Professional development workshops</li>
                  <li>• Peer support community</li>
                </ul>
                <Link to="/apalsa-mentorship">
                  <Button 
                    size="lg" 
                    className="w-full bg-primary hover:bg-secondary-green text-white transition-all duration-300"
                  >
                    Join Program
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Outlines Hub Card */}
            <Card className="group hover:shadow-gold transition-all duration-300 border-2 border-transparent hover:border-gold-light/30 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center group-hover:bg-secondary-green transition-colors">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-primary">
                  Outlines Hub
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Access comprehensive study outlines and course materials for law school success
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 mb-6 text-sm text-muted-foreground">
                  <li>• Course outlines by subject</li>
                  <li>• Study guides and summaries</li>
                  <li>• Exam preparation materials</li>
                  <li>• User ratings and reviews</li>
                </ul>
                <Button 
                  size="lg" 
                  className="w-full bg-primary hover:bg-secondary-green text-white transition-all duration-300"
                  onClick={() => navigate('/outlines')}
                >
                  Explore Outlines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ResourceHub;