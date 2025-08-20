import HeroSection from "@/components/HeroSection";
import Header from "@/components/Header";  
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Index;