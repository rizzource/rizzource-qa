import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import MentorMenteeSelection from "@/components/MentorMenteeSelection";
import SignupForm from "@/components/SignupForm";
import Header from "@/components/Header";  
import Footer from "@/components/Footer";

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
        {appState === 'hero' && <HeroSection onStartProgram={handleStartProgram} />}
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