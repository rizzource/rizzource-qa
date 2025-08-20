import HeroSection from "@/components/HeroSection";
import FeatureHighlights from "@/components/FeatureHighlights";
import ResourcesSection from "@/components/ResourcesSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import StudyGroupsSection from "@/components/StudyGroupsSection";
import AboutSection from "@/components/AboutSection";
import CTA from "@/components/CTA";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeatureHighlights />
        <ResourcesSection />
        <CaseStudiesSection />
        <StudyGroupsSection />
        <AboutSection />
        <CTA />
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Index;
