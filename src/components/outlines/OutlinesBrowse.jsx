import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, Download, Eye } from "lucide-react";

const OutlinesBrowse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Mock data for demonstration
  const mockOutlines = [
    {
      id: 1,
      title: "Constitutional Law Comprehensive Outline",
      subject: "Constitutional Law",
      year: "2L",
      rating: 4.8,
      downloads: 234,
      author: "Anonymous",
      description: "Complete outline covering all major constitutional law topics including due process, equal protection, and judicial review.",
      tags: ["Due Process", "Equal Protection", "Judicial Review"]
    },
    {
      id: 2,
      title: "Contracts Final Exam Outline",
      subject: "Contracts",
      year: "1L",
      rating: 4.6,
      downloads: 189,
      author: "Anonymous",
      description: "Condensed outline perfect for final exam preparation with key cases and rules.",
      tags: ["UCC", "Common Law", "Remedies"]
    },
    {
      id: 3,
      title: "Criminal Law Case Briefs & Outline",
      subject: "Criminal Law",
      year: "1L",
      rating: 4.9,
      downloads: 156,
      author: "Anonymous",
      description: "Detailed outline with case briefs for major criminal law decisions.",
      tags: ["Mens Rea", "Actus Reus", "Defenses"]
    }
  ];

  const subjects = ["All Subjects", "Constitutional Law", "Contracts", "Criminal Law", "Torts", "Civil Procedure"];
  const years = ["All Years", "1L", "2L", "3L"];
  const sortOptions = ["Newest", "Highest Rated", "Most Downloaded"];

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search outlines by title, subject, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-border/50 focus:border-light-green"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="bg-white border-border/50">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-border/50 shadow-lg z-50">
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject.toLowerCase().replace(" ", "-")}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-white border-border/50">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-border/50 shadow-lg z-50">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toLowerCase().replace(" ", "-")}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white border-border/50">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-border/50 shadow-lg z-50">
                {sortOptions.map((option) => (
                  <SelectItem key={option} value={option.toLowerCase().replace(" ", "-")}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">
            Found {mockOutlines.length} outlines
          </h3>
          <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>

        {/* Outline Cards */}
        <div className="grid gap-6">
          {mockOutlines.map((outline) => (
            <Card key={outline.id} className="bg-white/95 backdrop-blur-sm border-white/20 hover:shadow-gold transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-primary hover:text-secondary-green cursor-pointer">
                      {outline.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {outline.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-gold-light text-gold-light" />
                    <span>{outline.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {outline.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-light-green/20 text-primary hover:bg-light-green/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{outline.subject}</span>
                      <span>•</span>
                      <span>{outline.year}</span>
                      <span>•</span>
                      <span>{outline.downloads} downloads</span>
                    </div>
                    <span>by {outline.author}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" className="bg-gold-light text-primary hover:bg-gold-dark">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutlinesBrowse;