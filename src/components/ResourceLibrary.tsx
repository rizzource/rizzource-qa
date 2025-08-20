import { useState, useEffect, Suspense, lazy } from "react";
import { Search, Filter, BookOpen, Download, Star, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Resource, ResourceCategory, DifficultyLevel, SearchFilters } from "@/types/resource";
import { mockResources } from "@/data/mockResources";

// Lazy load heavy components for better performance
const ResourceCard = lazy(() => import("./ResourceCard"));

const ResourceLibrary = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    categories: [],
    difficultyLevels: [],
    tags: [],
    sortBy: "relevance",
    sortOrder: "desc"
  });

  const categories: ResourceCategory[] = [
    'Case Law', 'Statutes', 'Study Guides', 'Practice Exams', 'Legal Writing', 'Bar Prep', 'Research Tools'
  ];

  const difficultyLevels: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const popularTags = [
    'Constitutional Law', 'Criminal Law', 'Contract Law', 'Tort Law', 'Civil Procedure',
    'Evidence', 'Property Law', 'Family Law', 'Corporate Law', 'Tax Law'
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setResources(mockResources);
      setFilteredResources(mockResources);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = resources;

    // Apply text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(resource =>
        filters.categories.includes(resource.category)
      );
    }

    // Apply difficulty filters
    if (filters.difficultyLevels.length > 0) {
      filtered = filtered.filter(resource =>
        filters.difficultyLevels.includes(resource.difficulty_level)
      );
    }

    // Apply tag filters
    if (filters.tags.length > 0) {
      filtered = filtered.filter(resource =>
        filters.tags.some(tag => resource.tags.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'popularity':
          comparison = a.downloads - b.downloads;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        default:
          comparison = a.title.localeCompare(b.title);
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredResources(filtered);
  }, [resources, filters]);

  const updateFilters = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (
    key: 'categories' | 'difficultyLevels' | 'tags', 
    value: string
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === 'categories' 
        ? prev[key].includes(value as ResourceCategory)
          ? prev[key].filter(item => item !== value)
          : [...prev[key], value as ResourceCategory]
        : key === 'difficultyLevels'
        ? prev[key].includes(value as DifficultyLevel)
          ? prev[key].filter(item => item !== value)
          : [...prev[key], value as DifficultyLevel]
        : prev[key].includes(value)
          ? prev[key].filter(item => item !== value)
          : [...prev[key], value]
    }));
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="resource-card">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded shimmer"></div>
              <div className="h-4 bg-gray-200 rounded shimmer w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded shimmer w-1/2"></div>
              <div className="flex space-x-2">
                <div className="h-6 w-16 bg-gray-200 rounded shimmer"></div>
                <div className="h-6 w-20 bg-gray-200 rounded shimmer"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Resource Library</h1>
          <p className="text-xl text-muted-foreground">
            Discover comprehensive legal resources, case studies, and study materials
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-6">
          
          {/* Mobile Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search resources, cases, topics..."
              value={filters.query}
              onChange={(e) => updateFilters('query', e.target.value)}
              className="pl-10 search-focus h-12 sm:h-10 text-base sm:text-sm"
            />
          </div>

          {/* Mobile Filter Sheet */}
          <div className="block md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-center touch-target"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {(filters.categories.length > 0 || filters.difficultyLevels.length > 0 || filters.tags.length > 0) && (
                    <Badge variant="secondary" className="ml-2 h-5">
                      {filters.categories.length + filters.difficultyLevels.length + filters.tags.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <div className="flex flex-col h-full">
                  <div className="border-b pb-4 mb-4">
                    <h3 className="text-lg font-semibold">Filter Resources</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-6">
                    {/* Categories */}
                    <div>
                      <h4 className="font-semibold mb-3 text-foreground">Categories</h4>
                      <div className="space-y-3">
                        {categories.map(category => (
                          <div key={category} className="flex items-center space-x-3 touch-target">
                            <Checkbox
                              id={`category-${category}`}
                              checked={filters.categories.includes(category)}
                              onCheckedChange={() => toggleArrayFilter('categories', category)}
                              className="filter-checkbox"
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="text-sm text-foreground cursor-pointer flex-1"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty Levels */}
                    <div>
                      <h4 className="font-semibold mb-3 text-foreground">Difficulty</h4>
                      <div className="space-y-3">
                        {difficultyLevels.map(level => (
                          <div key={level} className="flex items-center space-x-3 touch-target">
                            <Checkbox
                              id={`difficulty-${level}`}
                              checked={filters.difficultyLevels.includes(level)}
                              onCheckedChange={() => toggleArrayFilter('difficultyLevels', level)}
                              className="filter-checkbox"
                            />
                            <label
                              htmlFor={`difficulty-${level}`}
                              className="text-sm text-foreground cursor-pointer flex-1"
                            >
                              {level}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="font-semibold mb-3 text-foreground">Legal Areas</h4>
                      <div className="space-y-3">
                        {popularTags.map(tag => (
                          <div key={tag} className="flex items-center space-x-3 touch-target">
                            <Checkbox
                              id={`tag-${tag}`}
                              checked={filters.tags.includes(tag)}
                              onCheckedChange={() => toggleArrayFilter('tags', tag)}
                              className="filter-checkbox"
                            />
                            <label
                              htmlFor={`tag-${tag}`}
                              className="text-sm text-foreground cursor-pointer flex-1"
                            >
                              {tag}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filter Bar */}
          <div className="hidden md:flex flex-wrap gap-4 p-4 bg-card rounded-lg border">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filters:</span>
            </div>
            
            {/* Categories Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 border-dashed"
                >
                  Categories
                  {filters.categories.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5">
                      {filters.categories.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="dropdown-content w-56" align="start">
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2 dropdown-item">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => toggleArrayFilter('categories', category)}
                        className="filter-checkbox"
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm text-foreground cursor-pointer flex-1"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Difficulty Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 border-dashed"
                >
                  Difficulty
                  {filters.difficultyLevels.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5">
                      {filters.difficultyLevels.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="dropdown-content w-48" align="start">
                <div className="space-y-2">
                  {difficultyLevels.map(level => (
                    <div key={level} className="flex items-center space-x-2 dropdown-item">
                      <Checkbox
                        id={`difficulty-${level}`}
                        checked={filters.difficultyLevels.includes(level)}
                        onCheckedChange={() => toggleArrayFilter('difficultyLevels', level)}
                        className="filter-checkbox"
                      />
                      <label
                        htmlFor={`difficulty-${level}`}
                        className="text-sm text-foreground cursor-pointer flex-1"
                      >
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Legal Areas Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 border-dashed"
                >
                  Legal Areas
                  {filters.tags.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5">
                      {filters.tags.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="dropdown-content w-56" align="start">
                <div className="space-y-2">
                  {popularTags.map(tag => (
                    <div key={tag} className="flex items-center space-x-2 dropdown-item">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={filters.tags.includes(tag)}
                        onCheckedChange={() => toggleArrayFilter('tags', tag)}
                        className="filter-checkbox"
                      />
                      <label
                        htmlFor={`tag-${tag}`}
                        className="text-sm text-foreground cursor-pointer flex-1"
                      >
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear Filters Button */}
            {(filters.categories.length > 0 || filters.difficultyLevels.length > 0 || filters.tags.length > 0) && (
              <Button
                variant="ghost"
                onClick={() => setFilters({
                  ...filters,
                  categories: [],
                  difficultyLevels: [],
                  tags: []
                })}
                className="h-9 px-2 lg:px-3"
              >
                Clear
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(filters.categories.length > 0 || filters.difficultyLevels.length > 0 || filters.tags.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {filters.categories.map(category => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="bg-secondary/10 text-secondary hover:bg-secondary/20"
                >
                  {category}
                  <button
                    onClick={() => toggleArrayFilter('categories', category)}
                    className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.difficultyLevels.map(level => (
                <Badge
                  key={level}
                  variant="outline"
                  className="border-gold-primary/30 text-gold-dark"
                >
                  {level}
                  <button
                    onClick={() => toggleArrayFilter('difficultyLevels', level)}
                    className="ml-1 hover:bg-gold-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-muted-foreground"
                >
                  {tag}
                  <button
                    onClick={() => toggleArrayFilter('tags', tag)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-6">
            
            {/* Search Bar and Controls */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search resources, cases, topics..."
                  value={filters.query}
                  onChange={(e) => updateFilters('query', e.target.value)}
                  className="pl-10 search-focus"
                />
              </div>
              
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-');
                  updateFilters('sortBy', sortBy);
                  updateFilters('sortOrder', sortOrder);
                }}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-border shadow-lg z-50">
                  <SelectItem value="relevance-desc">Most Relevant</SelectItem>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="popularity-desc">Most Popular</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : `${filteredResources.length} resources found`}
              </p>
            </div>

            {/* Resource Grid */}
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-4">
                <Suspense fallback={<LoadingSkeleton />}>
                  {filteredResources.map((resource) => (
                    <div key={resource.id} className="swipe-in">
                      <ResourceCard resource={resource} />
                    </div>
                  ))}
                </Suspense>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredResources.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No resources found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse our featured collections
                </p>
                <Button 
                  onClick={() => setFilters({
                    query: "",
                    categories: [],
                    difficultyLevels: [],
                    tags: [],
                    sortBy: "relevance",
                    sortOrder: "desc"
                  })}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceLibrary;