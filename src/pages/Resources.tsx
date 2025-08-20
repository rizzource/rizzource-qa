import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceLibrary from "@/components/ResourceLibrary";
import BottomNavigation from "@/components/BottomNavigation";

const Resources = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16 pb-20 md:pb-0">
        <ResourceLibrary />
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Resources;