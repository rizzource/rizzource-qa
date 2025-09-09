import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OutlinesBrowse from "./outlines/OutlinesBrowse";
import OutlinesUpload from "./outlines/OutlinesUpload";
import { useNavigate, useSearchParams } from "react-router-dom";

const OutlinesHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("browse");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "upload") {
      setActiveTab("upload");
    } else if (tabParam === "browse") {
      setActiveTab("browse");
    }
  }, [searchParams]);
  
  // Navigate back to resource hub
  const handleBack = () => {
    navigate('/resources');
  };

  return (
    <>
      <Header />
      <section className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-8 text-foreground hover:bg-muted whitespace-nowrap flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resource Hub
            </Button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
              Outlines Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access comprehensive study outlines and course materials for law school success
            </p>
          </div>

          {/* Tabbed Interface */}
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-2 bg-muted/50 backdrop-blur-sm border border-border rounded-xl p-1">
                  <TabsTrigger 
                    value="browse" 
                    className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-muted-foreground hover:text-foreground transition-all rounded-lg font-medium"
                  >
                    Browse Outlines
                  </TabsTrigger>
                  <TabsTrigger 
                    value="upload" 
                    className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-muted-foreground hover:text-foreground transition-all rounded-lg font-medium"
                  >
                    Upload Outline
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="browse" className="mt-8">
                <OutlinesBrowse />
              </TabsContent>

              <TabsContent value="upload" className="mt-8">
                <OutlinesUpload />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default OutlinesHub;