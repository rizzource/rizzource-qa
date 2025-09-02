import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import MentorMenteeSelection from "@/components/MentorMenteeSelection";
import SignupForm from "@/components/SignupForm";
import OutlinesHub from "@/components/OutlinesHub";
import { Users, BookOpen, Zap, FileText, GraduationCap } from "lucide-react";

const ResourceHub = () => {
  const [appState, setAppState] = useState('hero');
  const [userType, setUserType] = useState(null);

  const handleStartProgram = () => {
    setAppState('selection');
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setAppState('signup');
  };

  const handleBackToSelection = () => {
    setAppState('selection');
    setUserType(null);
  };

  const handleBackToHero = () => {
    setAppState('hero');
    setUserType(null);
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Resource Hub
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Access mentorship programs and comprehensive outline databases to support your legal education journey.
            </p>
          </div>

          <Tabs defaultValue="mentorship" className="w-full max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-lg border border-white/20">
              <TabsTrigger 
                value="mentorship" 
                className="data-[state=active]:bg-gold-primary data-[state=active]:text-primary-green text-white/90"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                APALSA Mentorship Program
              </TabsTrigger>
              <TabsTrigger 
                value="outlines" 
                className="data-[state=active]:bg-gold-primary data-[state=active]:text-primary-green text-white/90"
              >
                <FileText className="w-4 h-4 mr-2" />
                Outlines Hub
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mentorship" className="mt-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
                {appState === 'hero' && (
                  <>
                    <HeroSection onStartProgram={handleStartProgram} />
                    {/* Add visual break between hero and footer */}
                    <section className="py-16 sm:py-20 md:py-24">
                      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 max-w-4xl mx-auto">
                          <div className="text-center space-y-4 sm:space-y-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto shadow-lg">
                              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-semibold text-white">Friends</h3>
                            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                              Meet upper-year students, make friends and get connected to opportunities
                            </p>
                          </div>
                  
                          <div className="text-center space-y-4 sm:space-y-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto shadow-lg">
                              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-semibold text-white">Advice</h3>
                            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                              Get advice on classes, internships and navigating law school
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </>
                )}
                {appState === 'selection' && (
                  <MentorMenteeSelection 
                    onSelectType={handleUserTypeSelect}
                    onBack={handleBackToHero}
                  />
                )}
                {appState === 'signup' && userType && (
                  <SignupForm 
                    userType={userType}
                    onBack={handleBackToSelection}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="outlines" className="mt-6">
              <OutlinesHub />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResourceHub;