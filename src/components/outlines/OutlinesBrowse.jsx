import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Star, Download, Eye, FileText, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const OutlinesBrowse = () => {
  const [filters, setFilters] = useState({
    keyword: "",
    professor: "",
    topic: "all",
    year: "all", 
    rating: "all",
    sort: "newest"
  });
  const [outlines, setOutlines] = useState([]);
  const [loading, setLoading] = useState(true);

  const topics = ["All Topics", "Constitutional Law", "Contracts", "Criminal Law", "Torts", "Civil Procedure", "Property Law", "Administrative Law", "Evidence"];
  const years = ["All Years", "1L", "2L", "3L"];
  const ratings = ["All Ratings", "5 Stars", "4+ Stars", "3+ Stars", "2+ Stars", "1+ Stars"];
  const sortOptions = ["Newest", "Highest Rated", "Most Popular"];

  useEffect(() => {
    fetchOutlines();
  }, [filters]);

  const fetchOutlines = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('outlines')
        .select('*');

      // Apply filters only when they have valid values
      if (filters.keyword && filters.keyword.trim()) {
        query = query.or(`title.ilike.%${filters.keyword}%,notes.ilike.%${filters.keyword}%`);
      }
      
      if (filters.professor && filters.professor.trim()) {
        query = query.ilike('professor', `%${filters.professor}%`);
      }
      
      if (filters.topic && filters.topic !== 'all' && filters.topic !== '') {
        const topicValue = filters.topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        query = query.eq('topic', topicValue);
      }
      
      if (filters.year && filters.year !== 'all' && filters.year !== '') {
        const yearValue = filters.year.toUpperCase().replace('-', '');
        query = query.eq('year', yearValue);
      }
      
      if (filters.rating && filters.rating !== 'all' && filters.rating !== '') {
        const ratingMatch = filters.rating.match(/(\d+)/);
        if (ratingMatch) {
          const minRating = parseInt(ratingMatch[1]);
          if (!isNaN(minRating)) {
            query = query.gte('rating_avg', minRating);
          }
        }
      }

      // Apply sorting
      switch (filters.sort) {
        case 'highest-rated':
          query = query.order('rating_avg', { ascending: false, nullsLast: true });
          break;
        case 'most-popular':
          query = query.order('downloads', { ascending: false, nullsLast: true });
          break;
        default: // newest
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setOutlines(data || []);
    } catch (error) {
      console.error('Error fetching outlines:', error);
      setOutlines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      professor: "",
      topic: "all",
      year: "all",
      rating: "all", 
      sort: "newest"
    });
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

  // Generate mock preview data for an outline
  const getMockPreviewData = (outline) => {
    const mockDescriptions = [
      "Comprehensive overview of key concepts and legal principles with detailed case studies and practical applications.",
      "In-depth analysis of fundamental theories and landmark cases with strategic insights for examinations.",
      "Complete study guide covering essential topics with bullet-point summaries and critical legal analysis.",
      "Structured outline featuring major doctrines, case law, and practical examples for thorough understanding."
    ];

    const mockBulletPoints = {
      "Constitutional Law": [
        "Separation of Powers and Checks & Balances",
        "Due Process Clause Analysis and Applications",
        "Equal Protection Standards and Scrutiny Levels",
        "Commerce Clause and Federal vs State Authority"
      ],
      "Contracts": [
        "Formation Requirements: Offer, Acceptance, Consideration",
        "Contract Interpretation and Parol Evidence Rule",
        "Breach of Contract and Available Remedies",
        "Third Party Rights and Assignment Rules"
      ],
      "Criminal Law": [
        "Elements of Criminal Liability and Mens Rea",
        "Homicide Classifications and Defenses",
        "Property Crimes and Theft Offenses",
        "Constitutional Criminal Procedure Rights"
      ],
      "Torts": [
        "Negligence Elements and Standard of Care",
        "Intentional Torts and Available Defenses",
        "Strict Liability and Product Liability",
        "Damages Calculation and Compensation"
      ]
    };

    return {
      title: outline.title,
      description: mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)],
      bulletPoints: mockBulletPoints[outline.topic] || [
        "Core legal principles and foundational concepts",
        "Case law analysis and judicial interpretations", 
        "Practical applications and real-world examples",
        "Exam strategies and key points to remember"
      ]
    };
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card className="bg-card backdrop-blur-sm border-border">
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
              className="pl-10 bg-card border-border focus:border-accent focus:ring-2 focus:ring-accent"
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
                className="bg-card border-border focus:border-accent focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Topic Filter */}
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">Topic</label>
              <Select value={filters.topic} onValueChange={(value) => handleFilterChange('topic', value)}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Select Topic" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg z-50">
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic === "All Topics" ? "all" : topic.toLowerCase().replace(/ /g, "-")}>
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
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg z-50">
                  {years.map((year) => (
                    <SelectItem key={year} value={year === "All Years" ? "all" : year.toLowerCase().replace(/ /g, "-")}>
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
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Min Rating" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg z-50">
                  {ratings.map((rating) => (
                    <SelectItem key={rating} value={rating === "All Ratings" ? "all" : rating.toLowerCase().replace(/ /g, "-")}>
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
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg z-50">
                  {sortOptions.map((option) => (
                    <SelectItem key={option} value={option.toLowerCase().replace(/ /g, "-")}>
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
          <h3 className="text-xl font-semibold text-foreground">
            {loading ? 'Loading...' : `Found ${outlines.length} outlines`}
          </h3>
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={clearFilters}
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        )}

        {/* No Results */}
        {!loading && outlines.length === 0 && (
          <Card className="bg-card backdrop-blur-sm border-border">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">No outlines found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or clear the filters.</p>
            </CardContent>
          </Card>
        )}

        {/* Outline Cards Grid */}
        {!loading && outlines.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outlines.map((outline) => (
              <Card key={outline.id} className="bg-card backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300 h-full flex flex-col">
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
                    <Badge className="bg-accent text-accent-foreground font-medium px-2 py-1">
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
                      {/* <span>{outline.file_size || 'N/A'} MB • {outline.file_type || 'PDF'}</span> */}
                      <span>{outline.downloads || 0} downloads</span>
                    </div>

                    {/* Rating */}
                    <div>
                      {renderStars(outline.rating_avg || 0, outline.rating_count || 0)}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {(outline.tags || []).slice(0, 3).map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="text-xs bg-muted/50 text-foreground hover:bg-muted px-2 py-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {(outline.tags || []).length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground px-2 py-1">
                          +{(outline.tags || []).length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 mt-auto">
                    <Link to={`/outlines/${outline.id}`}>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="px-3 py-2 border-primary text-primary hover:bg-primary/10"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="px-3 py-2 border-accent text-accent hover:bg-accent/10"
                        >
                          <BookOpen className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold text-primary">
                            {getMockPreviewData(outline).title}
                          </DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            Professor {outline.professor} • {outline.topic} • {outline.year}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 pt-4">
                          <div>
                            <h4 className="text-lg font-medium text-primary mb-3">Description</h4>
                            <p className="text-foreground leading-relaxed">
                              {getMockPreviewData(outline).description}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-medium text-primary mb-3">Key Topics Covered</h4>
                            <ul className="space-y-2">
                              {getMockPreviewData(outline).bulletPoints.map((point, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-accent rounded-full mt-2.5 flex-shrink-0"></div>
                                  <span className="text-foreground">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{outline.downloads || 0} downloads</span>
                              <div className="flex items-center gap-1">
                                {renderStars(outline.rating_avg || 0, outline.rating_count || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      className="px-3 py-2"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlinesBrowse;