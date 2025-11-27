import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Star, Download, FileText, Eye, User, X } from "lucide-react";
import { toast } from 'react-toastify';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { downloadOutlineAsPDF, downloadOutlineAsDocx } from "@/utils/outlineDownload";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min?url';
import mammoth from "mammoth";

// Configure PDF.js worker via Vite asset URL
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const OutlineView = () => {
  const { id } = useParams();
  const [outline, setOutline] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const navigate = useNavigate();

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
          console.log('Outline loaded:', data);
          console.log('PDF file URL:', data.file_url);
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

  useEffect(() => {
    const extractTextFromFile = async () => {
      if (!outline?.file_url || !outline?.file_type) return;

      try {
        if (outline.file_type === "application/pdf") {
          // PDF extraction using pdfjs
          const loadingTask = pdfjs.getDocument(outline.file_url);
          const pdf = await loadingTask.promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(" ") + "\n";
          }
          setExtractedText(text.trim());
        } else if (
          outline.file_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
        ) {
          // DOCX extraction using mammoth
          const response = await fetch(outline.file_url);
          const arrayBuffer = await response.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          setExtractedText(result.value.trim());
        } else if (
          outline.file_type === "application/msword" // .doc
        ) {
          // DOC extraction using mammoth (may not always work)
          const response = await fetch(outline.file_url);
          const arrayBuffer = await response.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          setExtractedText(result.value.trim());
        } else if (
          outline.file_type === "audio/mpeg" || // .mp3
          outline.file_type === "audio/mp3" ||
          outline.file_type === "audio/x-m4a" || // .m4a
          outline.file_type === "audio/mp4"
        ) {
          setExtractedText("This is an audio file. Text preview is not available.");
        } else {
          setExtractedText("Preview not supported for this file type.");
        }
      } catch (err) {
        setExtractedText("Could not extract text from this document.");
        console.error("Text extraction error:", err);
      }
    };

    extractTextFromFile();
  }, [outline?.file_url, outline?.file_type]);

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

  const handleDownload = async () => {
    try {
      // Direct download using the original file URL
      const response = await fetch(outline.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = outline.file_name || `${outline.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch (error) {
      console.error('Download failed', error);
      toast.error('Please try again.');
    }
  };


  // PDF handlers
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };
  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setPdfError('Failed to load PDF. The file may be corrupted or not accessible.');
  };
  const previousPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const nextPage = () => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p + 1));

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
                         {(outline.tags || []).map((tag) => (
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

              {/* Description Field (Extracted Text) */}
              <Card className="bg-card backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                    {extractedText
                      ? extractedText
                      : "Extracting document text..."}
                  </div>
                </CardContent>
              </Card>

              {/* PDF Viewer - Button to open dialog */}
              {outline.file_url && outline.file_type === 'application/pdf' && (
                <Card className="bg-card backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      PDF Viewer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => {
                            console.log('Opening PDF dialog...');
                            setShowPdfDialog(true);
                          }}
                          className="px-6 py-3"
                          size="lg"
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          Open PDF Viewer
                        </Button>
                        <Button 
                          onClick={() => window.open(outline.file_url, '_blank')}
                          variant="outline"
                          size="lg"
                          className="px-6 py-3"
                        >
                          <FileText className="w-5 h-5 mr-2" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Non-PDF File Notice */}
              {outline.file_url && outline.file_type !== 'application/pdf' && (
                <Card className="bg-card backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      File Available
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 text-center">
                      <FileText className="w-12 h-12 text-accent mx-auto mb-4" />
                      <p className="text-primary font-medium mb-2">
                        {outline.file_type?.includes('word') ? 'Word Document' : 'Document'} Available
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use the download buttons to view this document
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
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

                  {/* Download Button */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* PDF Viewer Dialog */}
      {showPdfDialog && (
        <div 
          className="fixed inset-0 z-[10000] bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          onClick={() => setShowPdfDialog(false)}
        >
          <div 
            className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-[98vw] h-[92vh] max-w-[1600px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Eye className="w-5 h-5" />
                PDF Viewer - {outline?.title}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(outline?.file_url, '_blank')}
                  className="h-8 px-3"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Open in New Tab
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPdfDialog(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6 overflow-hidden">
              {pdfError ? (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center h-full flex items-center justify-center">
                  <div>
                    <FileText className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-medium mb-2">PDF Preview Error</p>
                    <p className="text-sm text-muted-foreground mb-4">{pdfError}</p>
                    <p className="text-sm text-muted-foreground">Please use the Download button to access the file.</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4 bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousPage}
                        disabled={pageNumber <= 1}
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground font-medium">
                        Page {pageNumber} of {numPages || '--'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextPage}
                        disabled={numPages ? pageNumber >= numPages : false}
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        Next
                      </Button>
                    </div>
                    
                  </div>
                  
                  <div className="flex-1 border border-border rounded-lg overflow-auto bg-white flex items-center justify-center">
                    <Document
                      file={outline?.file_url}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        width={Math.min(1400, window.innerWidth * 0.9)}
                      />
                    </Document>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default OutlineView;