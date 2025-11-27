import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// ⛔️ Removed shadcn Dialog imports to avoid portal/z-index issues in this view
import { Search, Filter, Star, Download, Eye, FileText, BookOpen, X } from "lucide-react";
import { Link } from "react-router-dom";



const OutlinesBrowse = () => {
  const [filters, setFilters] = useState({
    keyword: "",
    professor: "",
    topic: "all",
    year: "all",
    rating: "all",
    sort: "newest",
  });
  const [outlines, setOutlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState(["All Years"]);

  const fetchYears = async () => {
    try {
      const { data, error } = await supabase
        .from("outlines")
        .select("year", { distinct: true }); // ✅ distinct years only

      if (error) {
        console.error("Error fetching years:", error);
        return;
      }

      if (data && data.length > 0) {
        // Extract and clean
        const uniqueYears = [...new Set(data.map((item) => item.year))].sort();

        setYears(["All Years", ...uniqueYears]);
      } else {
        setYears(["All Years"]); // fallback if no outlines
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);


  // Single, page-level preview state (replaces Dialog)
  const [previewOutline, setPreviewOutline] = useState(null);

  const topics = [
    "All Topics",
    "Constitutional Law",
    "Contracts",
    "Criminal Law",
    "Torts",
    "Civil Procedure",
    "Property Law",
    "Administrative Law",
    "Evidence",
  ];
  const ratings = ["All Ratings", "5 Stars", "4+ Stars", "3+ Stars", "2+ Stars", "1+ Stars"];
  const sortOptions = ["Newest", "Highest Rated", "Most Popular"];

  // Body scroll lock to mirror dialog behavior, but controlled explicitly
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (previewOutline) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [previewOutline]);

  useEffect(() => {
    fetchOutlines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchOutlines = async () => {
    try {
      setLoading(true);
      let query = supabase.from("outlines").select("*");

      // Apply filters only when they have valid values
      if (filters.keyword && filters.keyword.trim()) {
        query = query.or(`title.ilike.%${filters.keyword}%,notes.ilike.%${filters.keyword}%`);
      }

      if (filters.professor && filters.professor.trim()) {
        query = query.ilike("professor", `%${filters.professor}%`);
      }

      if (filters.topic && filters.topic !== "all" && filters.topic !== "") {
        const topicValue = filters.topic.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        query = query.eq("topic", topicValue);
      }

      if (filters.year && filters.year !== "all" && filters.year !== "") {
        const yearValue = filters.year.toUpperCase().replace("-", "");
        query = query.eq("year", yearValue);
      }

      if (filters.rating && filters.rating !== "all" && filters.rating !== "") {
        const ratingMatch = filters.rating.match(/(\d+)/);
        if (ratingMatch) {
          const minRating = parseInt(ratingMatch[1]);
          if (!isNaN(minRating)) {
            query = query.gte("rating_avg", minRating);
          }
        }
      }

      // Apply sorting
      switch (filters.sort) {
        case "highest-rated":
          query = query.order("rating_avg", { ascending: false, nullsLast: true });
          break;
        case "most-popular":
          query = query.order("downloads", { ascending: false, nullsLast: true });
          break;
        default: // newest
          query = query.order("created_at", { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setOutlines(data || []);
    } catch (error) {
      console.error("Error fetching outlines:", error);
      setOutlines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      professor: "",
      topic: "all",
      year: "all",
      rating: "all",
      sort: "newest",
    });
  };

const handleDownload = async (outline) => {
  try {
    const url = outline?.file_url;
    if (!url) return;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const blob = await resp.blob();
    const contentType = blob.type || resp.headers.get("Content-Type") || "";
    const cd = resp.headers.get("Content-Disposition") || "";

    // 1) Try filename from data / headers / URL
    const nameFromData = outline.file_name;
    const nameFromCD = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(cd)?.[1];
    let nameFromURL = "";
    try {
      nameFromURL = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
    } catch {}

    let filename = nameFromData || nameFromCD || nameFromURL || "";

    // 2) If no extension, infer from content type; else keep as-is
    const hasExt = /\.[a-z0-9]{2,5}$/i.test(filename);
    if (!hasExt) {
      const base = (outline.title || "outline").replace(/[^\w.-]+/g, "_");
      const extMap = {
        "application/pdf": "pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "application/msword": "doc",
      };
      let ext = extMap[contentType] || "";
      if (!ext) {
        if (contentType.includes("pdf")) ext = "pdf";
        else if (contentType.includes("word")) ext = "docx";
      }
      filename = ext ? `${base}.${ext}` : base;
    }

    // 3) Download
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objectUrl);
  } catch (e) {
    console.error("Download failed", e);
  }
};


  const renderStars = (rating, count) => {
    const r = Number(rating || 0);
    const stars = [];
    const fullStars = Math.floor(r);
    const hasHalfStar = r % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-gold-light text-gold-light" />);
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
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex">{stars}</div>
        <span className="text-sm font-medium text-primary ml-1">{r.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">({count || 0})</span>
      </div>
    );
  };

  const closePreview = () => setPreviewOutline(null);

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search outlines by keyword..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
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
                onChange={(e) => handleFilterChange("professor", e.target.value)}
                className="bg-card border-border focus:border-accent focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Topic Filter */}
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">Topic</label>
              <Select value={filters.topic} onValueChange={(value) => handleFilterChange("topic", value)}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Select Topic" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg z-50">
                  {topics.map((topic) => (
                    <SelectItem
                      key={topic}
                      value={topic === "All Topics" ? "all" : topic.toLowerCase().replace(/ /g, "-")}
                    >
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">Year</label>
              <Select value={filters.year} onValueChange={(value) => handleFilterChange("year", value)}>
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
              <Select value={filters.rating} onValueChange={(value) => handleFilterChange("rating", value)}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Min Rating" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg z-50">
                  {ratings.map((rating) => (
                    <SelectItem
                      key={rating}
                      value={rating === "All Ratings" ? "all" : rating.toLowerCase().replace(/ /g, "-")}
                    >
                      {rating}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="text-sm font-medium text-primary mb-2 block">Sort By</label>
              <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
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
            {loading ? "Loading..." : `Found ${outlines.length} outlines`}
          </h3>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted" onClick={clearFilters}>
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
              <Card
                key={outline.id}
                className="bg-card backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300 h-full flex flex-col"
              >
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
                    <p className="text-sm font-medium text-primary">{outline.professor}</p>
                    <Badge className="bg-accent text-accent-foreground font-medium px-2 py-1">{outline.year}</Badge>
                  </div>

                  {/* Topic */}
                  <p className="text-sm text-muted-foreground font-medium">{outline.topic}</p>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {/* File Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{outline.downloads || 0} downloads</span>
                    </div>

                    {/* Rating */}
                    <div>{renderStars(outline.rating_avg || 0, outline.rating_count || 0)}</div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {(outline.tags || []).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-muted/50 text-foreground hover:bg-muted px-2 py-1">
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
                      <Button size="sm" variant="outline" className="px-3 py-2 border-primary text-primary hover:bg-primary/10">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>

                    {/* Preview opens custom modal - COMMENTED OUT FOR NOW */}
                    {/*<Button
                      size="sm"
                      variant="outline"
                      className="px-3 py-2 border-accent text-accent hover:bg-accent/10"
                      onClick={() => setPreviewOutline(outline)}
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Preview
                    </Button>*/}

                    <Button size="sm" className="px-3 py-2" onClick={() => handleDownload(outline)}>
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

      {/* Lightweight custom modal (no external Dialog deps) */}
      {previewOutline && (
        <div className="fixed inset-0 z-[10000]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closePreview}
            aria-hidden="true"
          />
          {/* Content */}
          <div
            role="dialog"
            aria-modal="true"
            className="absolute left-1/2 top-1/2 w-[min(90vw,42rem)] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card shadow-xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="pr-10">
                <h2 className="text-xl font-semibold text-primary">{previewOutline.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Professor {previewOutline.professor} • {previewOutline.topic} • {previewOutline.year}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md opacity-80 hover:opacity-100 focus:outline-none"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-medium text-primary mb-3">Description</h4>
                <p className="text-foreground leading-relaxed">
                  {(() => {
                    const notes = previewOutline.notes || "";
                    return notes.length > 200
                      ? notes.substring(0, 197) + "..."
                      : notes || "Comprehensive study outline covering key legal concepts and principles.";
                  })()}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-primary mb-3">Key Topics Covered</h4>
                <ul className="space-y-2">
                  {(() => {
                    const notes = previewOutline.notes || "";
                    const sentences = notes.split(/[.!?]+/).filter((s) => s.trim().length > 20);
                    const bulletPoints = sentences.slice(0, 4).map((s) => s.trim()).filter(Boolean);
                    const finalPoints =
                      bulletPoints.length > 0
                        ? bulletPoints
                        : [
                            "Core legal principles and foundational concepts",
                            "Case law analysis and judicial interpretations",
                            "Practical applications and real-world examples",
                            "Exam strategies and key points to remember",
                          ];
                    return finalPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-2.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                        <span className="text-foreground">{point}</span>
                      </li>
                    ));
                  })()}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{previewOutline.downloads || 0} downloads</span>
                  <div className="flex items-center gap-1">
                    {renderStars(previewOutline.rating_avg || 0, previewOutline.rating_count || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutlinesBrowse;
