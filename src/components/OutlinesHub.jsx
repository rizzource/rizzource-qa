import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OutlinesBrowse from "./outlines/OutlinesBrowse";
import OutlinesUpload from "./outlines/OutlinesUpload";
import { Search, Upload } from "lucide-react";

const OutlinesHub = () => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-lg border border-white/20 mb-6">
          <TabsTrigger 
            value="browse" 
            className="data-[state=active]:bg-gold-primary data-[state=active]:text-primary-green text-white/90"
          >
            <Search className="w-4 h-4 mr-2" />
            Browse Outlines
          </TabsTrigger>
          <TabsTrigger 
            value="upload" 
            className="data-[state=active]:bg-gold-primary data-[state=active]:text-primary-green text-white/90"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Outline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-0">
          <OutlinesBrowse />
        </TabsContent>

        <TabsContent value="upload" className="mt-0">
          <OutlinesUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OutlinesHub;