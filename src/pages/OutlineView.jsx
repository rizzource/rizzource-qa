import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Download, 
  Star, 
  FileText, 
  User, 
  Calendar, 
  Tag,
  Eye,
  ThumbsUp
} from "lucide-react";
import { toast } from "sonner";

const OutlineView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [outline, setOutline] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchOutline();
    if (user) {
      fetchUserRating();
    }
  }, [id, user]);

  const fetchOutline = async () => {
    try {
      const { data, error } = await supabase
        .from('outlines')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setOutline(data);
    } catch (error) {
      console.error('Error fetching outline:', error);
      toast.error('Failed to load outline');
      navigate('/resource-hub');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRating = async () => {
    try {
      const { data, error } = await supabase
        .from('outline_ratings')
        .select('rating')
        .eq('outline_id', id)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserRating(data.rating);
      }
    } catch (error) {
      // No existing rating is fine
      console.log('No existing rating found');
    }
  };

  const handleRatingSubmit = async (rating) => {
    if (!user) {
      toast.error('Please log in to rate outlines');
      return;
    }

    setSubmittingRating(true);

    try {
      const { error } = await supabase
        .from('outline_ratings')
        .upsert({
          outline_id: id,
          user_id: user.id,
          rating: rating
        }, {
          onConflict: 'outline_id,user_id'
        });

      if (error) throw error;

      setUserRating(rating);
      toast.success('Rating submitted successfully!');
      
      // Refresh the outline to get updated rating
      fetchOutline();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      // Increment download count
      const { error } = await supabase
        .from('outlines')
        .update({ downloads: outline.downloads + 1 })
        .eq('id', id);

      if (error) throw error;

      // Download the file
      if (outline.file_url) {
        window.open(outline.file_url, '_blank');
        toast.success(`Downloading ${format} file...`);
      } else {
        toast.error('File not available for download');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = interactive ? 
        (hoverRating >= i || (!hoverRating && userRating >= i)) :
        rating >= i;
      
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            filled ? 'fill-gold-primary text-gold-primary' : 'text-gray-300 hover:text-gold-primary'
          } ${interactive && submittingRating ? 'cursor-not-allowed opacity-50' : ''}`}
          onClick={interactive && !submittingRating ? () => handleRatingSubmit(i) : undefined}
          onMouseEnter={interactive && !submittingRating ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive && !submittingRating ? () => setHoverRating(0) : undefined}
        />
      );
    }
    return stars;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-white/20 rounded w-1/4"></div>
              <div className="h-32 bg-white/20 rounded"></div>
              <div className="h-64 bg-white/20 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!outline) {
    return (
      <div className="min-h-screen bg-hero-gradient">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl text-white mb-4">Outline not found</h1>
              <Button onClick={() => navigate('/resource-hub')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Resource Hub
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Button 
            onClick={() => navigate('/resource-hub')} 
            variant="outline"
            className="mb-6 border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resource Hub
          </Button>

          <div className="grid gap-6">
            {/* Main outline info */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white text-2xl mb-2">
                      {outline.title}
                    </CardTitle>
                    <CardDescription className="text-white/70 text-lg">
                      <User className="w-4 h-4 inline mr-1" />
                      {outline.professor}
                    </CardDescription>
                  </div>
                  <Badge className="bg-gold-primary text-primary-green font-medium text-lg px-3 py-1">
                    {outline.year}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="border-white/20 text-white">
                    <FileText className="w-4 h-4 mr-1" />
                    {outline.topic}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-white">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(outline.created_at)}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-white">
                    <Eye className="w-4 h-4 mr-1" />
                    {formatFileSize(outline.file_size)}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-white">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {outline.downloads} downloads
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Rating section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-medium">Overall Rating:</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(outline.rating_avg)}
                      </div>
                      <span className="text-white/80">
                        {outline.rating_avg.toFixed(1)} ({outline.rating_count} rating{outline.rating_count !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>

                  {user && (
                    <div className="flex items-center space-x-4">
                      <span className="text-white font-medium">Your Rating:</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderStars(userRating, true)}
                        </div>
                        {userRating > 0 && (
                          <span className="text-white/80">
                            You rated this {userRating} star{userRating !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {!user && (
                    <p className="text-white/60 text-sm">
                      Log in to rate this outline
                    </p>
                  )}
                </div>

                {/* Tags */}
                {outline.tags && outline.tags.length > 0 && (
                  <div>
                    <h3 className="text-white font-medium mb-2 flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {outline.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-white/10 text-white/80 border-white/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {outline.notes && (
                  <div>
                    <h3 className="text-white font-medium mb-2">Description</h3>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                        {outline.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* File preview placeholder */}
                <div>
                  <h3 className="text-white font-medium mb-2">File Preview</h3>
                  <div className="bg-white/5 rounded-lg p-8 border border-white/10 text-center">
                    <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/70 mb-2">
                      {outline.file_name}
                    </p>
                    <p className="text-white/50 text-sm">
                      Preview not available - download to view content
                    </p>
                  </div>
                </div>

                {/* Download buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handleDownload('PDF')} 
                    className="bg-gold-primary hover:bg-gold-primary/90 text-primary-green font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download as PDF
                  </Button>
                  <Button 
                    onClick={() => handleDownload('DOCX')} 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download as DOCX
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OutlineView;