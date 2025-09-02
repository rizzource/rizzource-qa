import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, Download, Eye, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const OutlinesBrowse = () => {
  const [filters, setFilters] = useState({
    keyword: "",
    professor: "",
    topic: "",
    year: "all",
    rating: "all",
    sort: "newest"
  });

  // Mock data for demonstration - would come from Supabase in real implementation
  const mockOutlines = [
    {
      id: 1,
      title: "Constitutional Law Comprehensive Outline",
      professor: "Prof. Johnson",
      topic: "Constitutional Law",
      year: "2L",
      rating_avg: 4.8,
      rating_count: 23,
      downloads: 234,
      file_size: 2.5,
      file_type: "PDF",
      user_id: "user1",
      created_at: "2024-01-15",
      notes: "Complete outline covering all major constitutional law topics including due process, equal protection, and judicial review.",
      tags: ["Due Process", "Equal Protection", "Judicial Review"]
    },
    {
      id: 2,
      title: "Contracts Final Exam Outline",
      professor: "Prof. Smith",
      topic: "Contracts",
      year: "1L",
      rating_avg: 4.6,
      rating_count: 18,
      downloads: 189,
      file_size: 1.8,
      file_type: "DOCX",
      user_id: "user2",
      created_at: "2024-02-20",
      notes: "Condensed outline perfect for final exam preparation with key cases and rules.",
      tags: ["UCC", "Common Law", "Remedies"]
    },
    {
      id: 3,
      title: "Criminal Law Case Briefs & Outline",
      professor: "Prof. Williams",
      topic: "Criminal Law",
      year: "1L",
      rating_avg: 4.9,
      rating_count: 31,
      downloads: 156,
      file_size: 3.2,
      file_type: "PDF",
      user_id: "user3",
      created_at: "2024-01-10",
      notes: "Detailed outline with case briefs for major criminal law decisions.",
      tags: ["Mens Rea", "Actus Reus", "Defenses"]
    },
    {
      id: 4,
      title: "Property Law Study Guide",
      professor: "Prof. Davis",
      topic: "Property Law",
      year: "2L",
      rating_avg: 4.3,
      rating_count: 15,
      downloads: 92,
      file_size: 2.1,
      file_type: "PDF",
      user_id: "user4",
      created_at: "2024-03-05",
      notes: "Comprehensive property law study guide with real estate focus.",
      tags: ["Real Estate", "Landlord-Tenant", "Easements"]
    }
  ];

  const topics = ["All Topics", "Constitutional Law", "Contracts", "Criminal Law", "Torts", "Civil Procedure", "Property Law", "Administrative Law", "Evidence"];
  const years = ["All Years", "1L", "2L", "3L"];
  const ratings = ["All Ratings", "5 Stars", "4+ Stars", "3+ Stars", "2+ Stars", "1+ Stars"];
  const sortOptions = ["Newest", "Highest Rated", "Most Popular"];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderStars = (rating, count) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-gold-light text-gold-light" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gold-light absolute" />
            <div className="overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-gold-light text-gold-light" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    
    return (
      <div className="flex items-center gap-1">
        <div className="flex">{stars}</div>
        <span className="text-sm font-medium text-primary ml-1">
          {rating.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">
          ({count})
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter Outlines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search outlines by keyword..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="pl-10 bg-white border-border/50 focus:border-light-green"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Professor Filter */}
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">Professor</label>
              <Input
                placeholder="Professor name..."
                value={filters.professor}
                onChange={(e) => handleFilterChange('professor', e.target.value)}
                className="bg-white border-border/50 focus:border-light-green"
              />
            </div>

            {/* Topic Filter */}
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">Topic</label>
              <Select value={filters.topic} onValueChange={(value) => handleFilterChange('topic', value)}>
                <SelectTrigger className="bg-white border-border/50">
                  <SelectValue placeholder="Select Topic" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-border/50 shadow-lg z-50">
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic.toLowerCase().replace(" ", "-")}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">Year</label>
              <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
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
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">Rating</label>
              <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                <SelectTrigger className="bg-white border-border/50">
                  <SelectValue placeholder="Min Rating" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-border/50 shadow-lg z-50">
                  {ratings.map((rating) => (
                    <SelectItem key={rating} value={rating.toLowerCase().replace(" ", "-")}>
                      {rating}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">Sort By</label>
              <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
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
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">
            Found {mockOutlines.length} outlines
          </h3>
          <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Outline Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockOutlines.map((outline) => (
            <Card key={outline.id} className="bg-white/95 backdrop-blur-sm border-white/20 hover:shadow-gold transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link to={`/outlines/${outline.id}`} className="flex-1">
                    <CardTitle className="text-lg text-primary leading-tight hover:text-secondary-green transition-colors cursor-pointer">
                      {outline.title}
                    </CardTitle>
                  </Link>
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
                
                {/* Professor and Year */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary">
                    {outline.professor}
                  </p>
                  <Badge className="bg-gold-light text-primary font-medium px-2 py-1">
                    {outline.year}
                  </Badge>
                </div>
                
                {/* Topic */}
                <p className="text-sm text-muted-foreground font-medium">
                  {outline.topic}
                </p>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  {/* File Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{outline.file_size} MB • {outline.file_type}</span>
                    <span>{outline.downloads} downloads</span>
                  </div>

                  {/* Rating */}
                  <div>
                    {renderStars(outline.rating_avg, outline.rating_count)}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {outline.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs bg-light-green/20 text-primary hover:bg-light-green/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {outline.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground">
                        +{outline.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                  <Link to={`/outlines/${outline.id}`} className="flex-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-primary text-primary hover:bg-primary/10"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gold-light text-primary hover:bg-gold-dark"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
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