import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Download, FileText, Eye, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const OutlineView = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [outline, setOutline] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Mock data for now - will be replaced with Supabase query
  const mockOutline = {
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
    file_url: "/sample-outline.pdf",
    user_id: "user1",
    created_at: "2024-01-15",
    notes: `This comprehensive Constitutional Law outline covers all major topics essential for law school success. The outline is structured chronologically and thematically, beginning with foundational principles of constitutional interpretation and moving through specific areas of constitutional doctrine.

Key topics covered include:
- Constitutional interpretation and judicial review
- Separation of powers and checks and balances
- Federalism and the Commerce Clause
- Individual rights and civil liberties
- Due Process (both procedural and substantive)
- Equal Protection Clause analysis
- First Amendment freedoms (speech, religion, press, assembly)
- Fourth Amendment search and seizure
- Fifth Amendment protections
- Fourteenth Amendment applications

Each section includes:
✓ Key cases with brief summaries and holdings
✓ Doctrinal tests and their applications
✓ Practice examples and hypotheticals
✓ Cross-references to related concepts
✓ Exam tips and common pitfalls

This outline was created during my 2L year after taking Constitutional Law with Professor Johnson. It incorporates class notes, textbook readings, and additional research to provide a comprehensive study tool. The outline has been used successfully by students in subsequent years, with many reporting improved exam performance.

Special attention has been paid to recent Supreme Court decisions and their impact on established doctrine. The outline is regularly updated to reflect current legal developments and maintains relevance for both academic study and bar examination preparation.`,
    tags: ["Due Process", "Equal Protection", "Judicial Review", "First Amendment", "Commerce Clause"]
  };

  useEffect(() => {
    // Mock loading - replace with actual Supabase query
    setLoading(true);
    setTimeout(() => {
      setOutline(mockOutline);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleRatingSubmit = async (rating) => {
    setRatingLoading(true);
    try {
      // Here you would implement the Supabase rating submission
      // For now, just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUserRating(rating);
      toast({
        title: "Rating Submitted",
        description: `You rated this outline ${rating} star${rating !== 1 ? 's' : ''}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
    setRatingLoading(false);
  };

  const handleDownload = (format) => {
    // Mock download functionality
    toast({
      title: "Download Started",
      description: `Downloading outline as ${format}...`,
      duration: 3000,
    });
  };

  const renderStars = (rating, interactive = false, size = "w-5 h-5") => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = interactive ? (hoverRating || userRating) >= i : rating >= i;
      const isHalfFilled = !interactive && rating >= i - 0.5 && rating < i;
      
      stars.push(
        <button
          key={i}
          onClick={interactive ? () => handleRatingSubmit(i) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          disabled={!interactive || ratingLoading}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${ratingLoading && interactive ? 'opacity-50' : ''}`}
        >
          {isHalfFilled ? (
            <div className={`relative ${size}`}>
              <Star className={`${size} text-gold-light absolute`} />
              <div className="overflow-hidden w-1/2">
                <Star className={`${size} fill-gold-light text-gold-light`} />
              </div>
            </div>
          ) : (
            <Star className={`${size} ${isFilled ? 'fill-gold-light text-gold-light' : 'text-gray-300'} transition-colors`} />
          )}
        </button>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-hero-gradient pt-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-light"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!outline) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-hero-gradient pt-16 flex items-center justify-center">
          <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-primary mb-2">Outline Not Found</h2>
              <p className="text-muted-foreground mb-4">The outline you're looking for doesn't exist.</p>
              <Link to="/outlines">
                <Button className="bg-primary hover:bg-secondary-green">
                  Back to Outlines
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <section className="min-h-screen bg-hero-gradient pt-16">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Back Navigation */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/outlines" className="flex items-center gap-2 text-white hover:text-gold-light transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Outlines</span>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Outline Header */}
              <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-primary mb-2">
                        {outline.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-primary">{outline.professor}</span>
                        </div>
                        <Badge className="bg-gold-light text-primary font-medium">
                          {outline.year}
                        </Badge>
                      </div>
                      <p className="text-lg font-medium text-secondary-green mb-2">
                        {outline.topic}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(outline.rating_avg)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {outline.rating_avg.toFixed(1)} ({outline.rating_count} reviews)
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Tags */}
              <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-primary mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {outline.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-light-green/20 text-primary hover:bg-light-green/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Description & Notes</h3>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <div className="whitespace-pre-line leading-relaxed">
                      {outline.notes}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File Preview */}
              <Card className="bg-white/95 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    File Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      {outline.file_type} File • {outline.file_size} MB
                    </p>
                    <p className="text-sm text-gray-500">
                      Preview functionality will be implemented with PDF.js for PDFs and document viewers for DOCX files
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Rating Card */}
              <Card className="bg-white/95 backdrop-blur-sm border-white/20 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">Rate This Outline</CardTitle>
                  <CardDescription>
                    Help other students by sharing your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="flex justify-center gap-1 mb-2">
                      {renderStars(userRating, true, "w-8 h-8")}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {hoverRating > 0 ? `Rate ${hoverRating} star${hoverRating !== 1 ? 's' : ''}` : 
                       userRating > 0 ? `You rated ${userRating} star${userRating !== 1 ? 's' : ''}` : 
                       'Click to rate'}
                    </p>
                  </div>

                  <Separator />

                  {/* File Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Type:</span>
                      <span className="font-medium text-primary">{outline.file_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size:</span>
                      <span className="font-medium text-primary">{outline.file_size} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Downloads:</span>
                      <span className="font-medium text-primary">{outline.downloads}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Download Buttons */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gold-light text-primary hover:bg-gold-dark"
                      onClick={() => handleDownload('PDF')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download as PDF
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10"
                      onClick={() => handleDownload('DOCX')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download as DOCX
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default OutlineView;