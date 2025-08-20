import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import MentorMenteeSelection from "@/components/MentorMenteeSelection";
import SignupForm from "@/components/SignupForm";
import Header from "@/components/Header";  
import Footer from "@/components/Footer";
import { Users, BookOpen, Zap } from "lucide-react";

type AppState = 'hero' | 'selection' | 'signup';
type UserType = 'mentor' | 'mentee' | null;

const Index = () => {
  const [appState, setAppState] = useState<AppState>('hero');
  const [userType, setUserType] = useState<UserType>(null);

  const handleStartProgram = () => {
    setAppState('selection');
  };

  const handleUserTypeSelect = (type: 'mentor' | 'mentee') => {
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
                  <h2 className="text-3xl font-bold text-foreground">
                    Join APALSA's Mentorship Network
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Connect with experienced legal professionals and fellow students in the Asian Pacific American Law Student Association community. Our mentorship program provides guidance, support, and networking opportunities to help you succeed in your legal career.
                  </p>
                  <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Professional Network</h3>
                      <p className="text-muted-foreground">Connect with legal professionals and expand your network</p>
                    </div>
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Career Guidance</h3>
                      <p className="text-muted-foreground">Get personalized advice for your legal career path</p>
                    </div>
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Zap className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Skills Development</h3>
                      <p className="text-muted-foreground">Enhance your legal skills through mentorship and support</p>
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
        {appState === 'signup' && userType && (
          <SignupForm 
            userType={userType}
            onBack={handleBackToSelection}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;