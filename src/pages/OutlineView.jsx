import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Download, FileText, Eye, User } from "lucide-react";
import { toast } from 'react-toastify';
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { downloadOutlineAsPDF, downloadOutlineAsDocx } from "@/utils/outlineDownload";


const OutlineView = () => {
  const { id } = useParams();
  const [outline, setOutline] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);
  const navigate = useNavigate();

  // Remove the mockOutline constant since we're now fetching from Supabase

  useEffect(() => {
    const fetchOutline = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('outlines')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setOutline(data);
          // Check if user has already rated this outline
          const user = await supabase.auth.getUser();
          if (user.data.user) {
            const { data: ratingData } = await supabase
              .from('outline_ratings')
              .select('rating')
              .eq('outline_id', id)
              .eq('user_id', user.data.user.id)
              .maybeSingle();
            
            if (ratingData) {
              setUserRating(ratingData.rating);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching outline:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutline();
  }, [id]);

  const handleRatingSubmit = async (rating) => {
    setRatingLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to rate outlines");
        return;
      }

      // Check if user has already rated this outline
      const { data: existingRating } = await supabase
        .from('outline_ratings')
        .select('id')
        .eq('outline_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from('outline_ratings')
          .update({ rating })
          .eq('id', existingRating.id);
        
        if (error) throw error;
      } else {
        // Create new rating
        const { error } = await supabase
          .from('outline_ratings')
          .insert({
            outline_id: id,
            user_id: user.id,
            rating
          });
        
        if (error) throw error;
      }
      
      setUserRating(rating);
      
      // Refresh outline data to get updated rating stats
      const { data: updatedOutline } = await supabase
        .from('outlines')
        .select('rating_avg, rating_count')
        .eq('id', id)
        .single();
        
      if (updatedOutline) {
        setOutline(prev => ({ ...prev, ...updatedOutline }));
      }
      
      toast.success(`You rated this outline ${rating} star${rating !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error("Failed to submit rating. Please try again.");
    }
    setRatingLoading(false);
  };

  const handleDownload = async (format) => {
    try {
      if (format === 'PDF') {
        await downloadOutlineAsPDF(outline);
      } else {
        await downloadOutlineAsDocx(outline);
      }
      toast.success(`Generating ${format}...`);
    } catch (error) {
      console.error('Download failed', error);
      toast.error('Please try again.');
    }
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
              <Star className={`${size} text-accent absolute`} />
              <div className="overflow-hidden w-1/2">
                <Star className={`${size} fill-accent text-accent`} />
              </div>
            </div>
          ) : (
            <Star className={`${size} ${isFilled ? 'fill-accent text-accent' : 'text-muted-foreground/40'} transition-colors`} />
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
        <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!outline) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <Card className="max-w-md mx-auto bg-card backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-primary mb-2">Outline Not Found</h2>
              <p className="text-muted-foreground mb-4">The outline you're looking for doesn't exist.</p>
              <Link to="/outlines">
                <Button className="">
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
      <section className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Back Navigation */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/outlines')}
              className="mb-8 text-foreground hover:bg-muted whitespace-nowrap flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Outlines
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Outline Header */}
              <Card className="bg-card backdrop-blur-sm border-border">
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
                        <Badge className="bg-accent text-accent-foreground font-medium px-2 py-1">
                          {outline.year}
                        </Badge>
                      </div>
                      <p className="text-lg font-medium text-secondary mb-2">
                        {outline.topic}
                      </p>
                    </div>
              
                    {/* Right section with ratings + tags */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1 justify-end">
                        {renderStars(outline.rating_avg)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-9">
                        {outline.rating_avg.toFixed(1)} ({outline.rating_count} reviews)
                      </p>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {outline.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-muted/50 text-foreground hover:bg-muted px-2 py-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Notes */}
              <Card className="bg-card backdrop-blur-sm border-border">
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
              {/* <Card className="bg-card backdrop-blur-sm border-border">
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
              </Card> */}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Rating Card */}
              <Card className="bg-card backdrop-blur-sm border-border sticky top-6">
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
                    {/* <div className="flex justify-between">
                      <span className="text-muted-foreground">File Type:</span>
                      <span className="font-medium text-primary">{outline.file_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size:</span>
                      <span className="font-medium text-primary">{outline.file_size} MB</span>
                    </div> */}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Downloads:</span>
                      <span className="font-medium text-primary">{outline.downloads}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Download Buttons */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
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