import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import MentorMenteeSelection from "@/components/MentorMenteeSelection";
import SignupForm from "@/components/SignupForm";
import Header from "@/components/Header";  
import Footer from "@/components/Footer";
import { Users, BookOpen, Zap } from "lucide-react";

const Index = () => {
  const [appState, setAppState] = useState('hero');
  const [userType, setUserType] = useState(null);

  const handleStartProgram = () => {
    setAppState('selection');
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setAppState(type); // 'mentor' or 'mentee'
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
    <div className="min-h-screen">
      <Header />
      <main>
        {appState === 'hero' && (
          <>
            <HeroSection onStartProgram={handleStartProgram} />
            {/* Add visual break between hero and footer */}
            <section className="bg-white py-20">
              <div className="container mx-auto px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Friends & Connections</h3>
                      <p className="text-muted-foreground">Meet upper-year students, make friends, and get connected to opportunities.</p>
                    </div>
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Guidance</h3>
                      <p className="text-muted-foreground">Get advice on classes, internships, and navigating law school.</p>
                    </div>
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Zap className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Support</h3>
                      <p className="text-muted-foreground">Swap outlines, share meals, and lean on mentors who’ve been through 1L.</p>
                    </div>
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
        {appState === 'mentor' && (
          <SignupForm userType="mentor" onBack={handleBackToSelection} />
        )}
        {appState === 'mentee' && (
          <SignupForm userType="mentee" onBack={handleBackToSelection} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;