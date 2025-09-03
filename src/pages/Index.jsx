import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import MentorMenteeSelection from "@/components/MentorMenteeSelection";
import SignupForm from "@/components/SignupForm";
import MinimalistHome from "@/components/MinimalistHome";
import Header from "@/components/Header";  
import Footer from "@/components/Footer";
import { Users, BookOpen, Zap } from "lucide-react";

const Index = ({ mentorshipPage = false, initialState = 'hero' }) => {
  const navigate = useNavigate();
  const [appState, setAppState] = useState(initialState);
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
    navigate('/resources');
  };

  // Show minimalist homepage if not mentorship page
  if (!mentorshipPage) {
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          <MinimalistHome />
        </main>
        <Footer />
      </div>
    );
  }

  return (<><div className="p-4 grid gap-3">
  <div className="h-10 bg-background border border-border" />
  <div className="h-10 bg-primary text-primary-foreground flex items-center justify-center">Primary</div>
  <div className="h-10 bg-card text-card-foreground border border-border flex items-center justify-center">Card</div>
  <div className="h-10 bg-gold-light text-foreground flex items-center justify-center">Gold</div>
</div>

    <div className="min-h-screen">
      <Header />
      <main>
        {appState === 'hero' && (
          <>
            <HeroSection onStartProgram={handleStartProgram} onBack={handleBackToHero} />
            {/* Add visual break between hero and footer */}
            <section className="bg-background py-16 sm:py-20 md:py-24">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 max-w-4xl mx-auto">
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Friends</h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                      Meet upper-year students, make friends and get connected to opportunities
                    </p>
                  </div>
          
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Advice</h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
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
      </main>
      <Footer />
    </div></>
  );
};

export default Index;