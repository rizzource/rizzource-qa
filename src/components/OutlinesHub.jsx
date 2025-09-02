import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OutlinesBrowse from "./outlines/OutlinesBrowse";
import OutlinesUpload from "./outlines/OutlinesUpload";

const OutlinesHub = () => {
  const [activeTab, setActiveTab] = useState("browse");

  return (
    <>
      <Header />
      <section className="min-h-screen bg-hero-gradient pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              as={Link}
              to="/resources"
              className="mb-8 text-white hover:bg-white/10 whitespace-nowrap flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resource Hub
            </Button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Outlines Hub
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Access comprehensive study outlines and course materials for law school success
            </p>
          </div>

          {/* Tabbed Interface */}
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1">
                  <TabsTrigger 
                    value="browse" 
                    className="data-[state=active]:bg-gold-light data-[state=active]:text-primary text-white/80 hover:text-white transition-all rounded-lg font-medium"
                  >
                    Browse Outlines
                  </TabsTrigger>
                  <TabsTrigger 
                    value="upload" 
                    className="data-[state=active]:bg-gold-light data-[state=active]:text-primary text-white/80 hover:text-white transition-all rounded-lg font-medium"
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