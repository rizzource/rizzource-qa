import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, Building2, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobApplicationForm from "@/components/jobs/JobApplicationForm";
import ResumeUpload from "@/components/jobs/ResumeUpload";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts } from 'pdf-lib';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [enhancingCV, setEnhancingCV] = useState(false);

  // New state for enhanced modal and editable text
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const [enhancedText, setEnhancedText] = useState("");
  const [editableText, setEditableText] = useState("");
  const [copied, setCopied] = useState(false);

  // Add new state for enhanced CV
  const [enhancedCVUrl, setEnhancedCVUrl] = useState(null);

  useEffect(() => {
    fetchJobDetails();
    if (user) {
      checkIfApplied();
      fetchUserProfile();
    }
  }, [id, user]);

  const fetchJobDetails = async () => {
    try {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("resume_url, resume_file_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const checkIfApplied = async () => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", id)
        .eq("applicant_id", user.id)
        .single();

      if (data) {
        setHasApplied(true);
      }
    } catch (error) {
      // User hasn't applied yet
    }
  };

  const handleEnhanceCV = async () => {
    if (!userProfile?.resume_url) {
      toast.error("Please upload your resume first");
      setShowResumeUpload(true);
      return;
    }

    setEnhancingCV(true);
    try {
      // Fetch the resume content
      const response = await fetch(userProfile.resume_url);
      const resumeText = await response.text();

      // Call edge function to enhance CV
      const { data, error } = await supabase.functions.invoke('enhance-cv', {
        body: {
          resumeText,
          jobDescription: job.description,
          jobTitle: job.title,
        }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits exhausted. Please add credits to continue.');
        } else {
          throw error;
        }
        return;
      }

      // Show enhanced text in editable modal instead of auto download
      const aiEnhanced = data.enhancedCV || "";
      setEnhancedText(aiEnhanced);
      setEditableText(aiEnhanced);
      setShowEnhancedModal(true);
      toast.success('AI suggestions ready — review and edit in the modal.');
    } catch (error) {
      console.error('Error enhancing CV:', error);
      toast.error('Failed to enhance CV. Please try again.');
    } finally {
      setEnhancingCV(false);
    }
  };

  // Generate downloadable files from current editable text
  const generateNewCV = async () => {
    try {
      const fileName = `enhanced-cv-${job.title.replace(/\s+/g, '-')}-${Date.now()}`;

      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size in points
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const fontSize = 11;
      const lineHeight = fontSize * 1.2; // Reduced line height
      const margin = 50;
      const maxWidth = page.getSize().width - (margin * 2);
      
      // Split text into paragraphs and handle each paragraph
      const paragraphs = editableText.split('\n').filter(para => para.trim()); // Remove empty lines

      let y = page.getSize().height - margin;
      let currentPage = page;

      for (const paragraph of paragraphs) {
        // Split paragraph into words and create lines
        const words = paragraph.split(' ');
        let currentLine = '';
        const lines = [];

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (lineWidth > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }

        // Draw lines of current paragraph
        for (const line of lines) {
          if (y < margin + fontSize) {
            // Create new page if we run out of space
            currentPage = pdfDoc.addPage([595, 842]);
            y = currentPage.getSize().height - margin;
          }

          currentPage.drawText(line, {
            x: margin,
            y,
            size: fontSize,
            font,
          });
          y -= lineHeight;
        }

        // Add spacing between paragraphs
        y -= fontSize; // Add single line space between paragraphs
      }

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(`enhanced-cvs/${user.id}/${fileName}.pdf`, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(`enhanced-cvs/${user.id}/${fileName}.pdf`);

      // Save reference to database
      const { error: dbError } = await supabase
        .from('enhanced_cvs')
        .insert({
          user_id: user.id,
          job_id: job.id,
          file_path: `enhanced-cvs/${user.id}/${fileName}.pdf`,
          public_url: publicUrl
        });

      if (dbError) throw dbError;

      toast.success('Enhanced CV generated and saved successfully!');
      setShowEnhancedModal(false);
    } catch (err) {
      console.error('Error generating and uploading CV:', err);
      toast.error('Failed to generate and save CV. Please try again.');
    }
  };

  const copyEnhancedText = async () => {
    try {
      await navigator.clipboard.writeText(editableText || "");
      toast.success('Copied to clipboard');
      setCopied(true);
      // reset label after a short delay
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy text');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline specified";
    return new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  // Add this new function to fetch the enhanced CV
  const fetchEnhancedCV = async () => {
    try {
      const { data, error } = await supabase
        .from('enhanced_cvs')
        .select('public_url')
        .eq('user_id', user.id)
        .eq('job_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data?.public_url;
    } catch (error) {
      console.error('Error fetching enhanced CV:', error);
      return null;
    }
  };

  // Modify the application button click handler
  const handleApplyClick = async () => {
    if (job.application_url) {
      window.open(job.application_url, "_blank");
    } else {
      try {
        // Fetch the enhanced CV URL before opening the form
        const enhancedUrl = await fetchEnhancedCV();
        console.log("Enhanced CV URL:", enhancedUrl); // Debug log
        
        if (enhancedUrl) {
          setEnhancedCVUrl(enhancedUrl);
          toast.success("Using your AI-enhanced CV for this application");
        } else {
          console.log("Using original resume:", userProfile?.resume_url); // Debug log
          setEnhancedCVUrl(null);
        }
        
        setShowApplicationForm(true);
      } catch (error) {
        console.error("Error preparing application:", error);
        toast.error("Error preparing your application");
      }
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Job not found</p>
            <Button onClick={() => navigate("/jobs")}>Back to Jobs</Button>
          </div>
        </div>
      </>
    );
  }

  // Update the conditional render for application form
  if (showApplicationForm) {
    return (
      <JobApplicationForm 
        job={job} 
        onCancel={() => setShowApplicationForm(false)} 
        resumeUrl={enhancedCVUrl || userProfile?.resume_url}
        // Add this prop to help with debugging
        isEnhancedCV={!!enhancedCVUrl}
      />
    );
  }

  if (showResumeUpload) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-16">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Button variant="ghost" onClick={() => setShowResumeUpload(false)} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Job Details
            </Button>
            <ResumeUpload onUploadComplete={() => {
              setShowResumeUpload(false);
              fetchUserProfile();
            }} />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/jobs")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                  <p className="text-xl text-muted-foreground mb-2">{job.company_name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {job.location && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </Badge>
                )}
                {job.job_type && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {job.job_type}
                  </Badge>
                )}
                {job.salary_range && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.salary_range}
                  </Badge>
                )}
                {job.application_deadline && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Apply by {formatDate(job.application_deadline)}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
              </div>

              <div className="pt-6 border-t space-y-4">
                {user && userProfile && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-6 py-3 text-base font-semibold rounded-xl"
                      onClick={handleEnhanceCV}
                      disabled={enhancingCV || !userProfile.resume_url}
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      {enhancingCV ? 'Enhancing...' : 'Enhance CV with AI'}
                    </Button>
                  </div>
                )}

                {!user ? (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Please sign in to apply for this job</p>
                    <Button 
                    className="rounded-xl hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
                    onClick={() => navigate('/auth')}
                    >
                      Sign In
                    </Button>
                  </div>
                ) : !userProfile?.resume_url ? (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Please upload your resume to apply for jobs</p>
                    <Button onClick={() => setShowResumeUpload(true)}>Upload Resume</Button>
                  </div>
                ) : hasApplied ? (
                  <div className="text-center">
                    <p className="text-green-600 font-medium">You have already applied for this position</p>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      className="px-6 py-3 text-base font-semibold rounded-xl hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
                      onClick={handleApplyClick}
                    >
                      {job.application_url ? 'Visit Website' : 'Apply Now'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced CV Modal */}
      {showEnhancedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEnhancedModal(false)}
          />
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">AI Suggested CV Changes</h3>
              <button
                onClick={() => setShowEnhancedModal(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Edit the suggestions below, then generate a new CV or copy the text.</p>

            <textarea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="w-full h-64 p-3 border border-slate-200 rounded-md bg-surface text-foreground resize-y"
            />

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={copyEnhancedText}>
                {copied ? "Copied" : "Copy Text"}
              </Button>
              <Button 
              className="hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
              onClick={generateNewCV}
              >
                Generate New CV
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default JobDetails;
