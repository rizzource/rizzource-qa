import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Star, Download, Eye, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const OutlinesBrowse = () => {
  const [outlines, setOutlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [professorFilter, setProfessorFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [professors, setProfessors] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetchOutlines();
  }, [searchTerm, professorFilter, topicFilter, yearFilter, sortBy]);

  const fetchOutlines = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('outlines')
        .select('*');

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,professor.ilike.%${searchTerm}%,topic.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
      }
      if (professorFilter) {
        query = query.eq('professor', professorFilter);
      }
      if (topicFilter) {
        query = query.eq('topic', topicFilter);
      }
      if (yearFilter) {
        query = query.eq('year', yearFilter);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'highest_rated':
          query = query.order('rating_avg', { ascending: false });
          break;
        case 'most_popular':
          query = query.order('downloads', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setOutlines(data || []);

      // Extract unique professors and topics for filters
      if (data) {
        const uniqueProfessors = [...new Set(data.map(o => o.professor))];
        const uniqueTopics = [...new Set(data.map(o => o.topic))];
        setProfessors(uniqueProfessors);
        setTopics(uniqueTopics);
      }
    } catch (error) {
      console.error('Error fetching outlines:', error);
      toast.error('Failed to load outlines');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {Array(fullStars).fill().map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-gold-primary text-gold-primary" />
        ))}
        {hasHalfStar && (
          <Star className="w-4 h-4 fill-gold-primary/50 text-gold-primary" />
        )}
        {Array(emptyStars).fill().map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setProfessorFilter("");
    setTopicFilter("");
    setYearFilter("");
    setSortBy("newest");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
          <Input
            placeholder="Search outlines by title, professor, topic, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-gold-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={professorFilter} onValueChange={setProfessorFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by Professor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Professors</SelectItem>
              {professors.map((prof) => (
                <SelectItem key={prof} value={prof}>{prof}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              <SelectItem value="1L">1L</SelectItem>
              <SelectItem value="2L">2L</SelectItem>
              <SelectItem value="3L">3L</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="highest_rated">Highest Rated</SelectItem>
              <SelectItem value="most_popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
          <span className="text-white/80">
            {outlines.length} outline{outlines.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill().map((_, i) => (
            <Card key={i} className="bg-white/10 border-white/20 animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-3 bg-white/20 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-3 bg-white/20 rounded"></div>
                <div className="h-3 bg-white/20 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlines.map((outline) => (
            <Card key={outline.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">{outline.title}</CardTitle>
                    <CardDescription className="text-white/70">
                      {outline.professor}
                    </CardDescription>
                  </div>
                  <Badge className="bg-gold-primary text-primary-green font-medium">
                    {outline.year}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <Badge variant="outline" className="border-white/20 text-white">
                  {outline.topic}
                </Badge>
                
                <div className="flex items-center space-x-2">
                  {renderStars(outline.rating_avg)}
                  <span className="text-white/80 text-sm">
                    {outline.rating_avg.toFixed(1)} ({outline.rating_count})
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-white/70">
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {formatFileSize(outline.file_size)}
                  </span>
                  <span>{outline.downloads} downloads</span>
                </div>

                {outline.tags && outline.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {outline.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/80">
                        {tag}
                      </Badge>
                    ))}
                    {outline.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-white/10 text-white/80">
                        +{outline.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/20 text-white hover:bg-white/10"
                  asChild
                >
                  <Link to={`/outlines/${outline.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Link>
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-gold-primary hover:bg-gold-primary/90 text-primary-green"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!loading && outlines.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/70 text-lg">No outlines found</p>
          <p className="text-white/50">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default OutlinesBrowse;