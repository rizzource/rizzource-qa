import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
import * as pdfjsLib from 'pdfjs-dist';
// For Vite: import the worker as a URL so the dev server/bundler can serve it
// (use the legacy entry to match the legacy pdf build).
// import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';

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
      // Extract only the Work / Professional Experience section from uploaded resume PDF
      const resumeWorkText = await extractWorkHistoryFromPdf(userProfile.resume_url);

      if (!resumeWorkText) {
        toast.error('Could not extract work history from resume. Using full resume text instead.');
      }

      const payload = {
        resumeText: resumeWorkText || "NO_EXTRACTED_TEXT", // required key: extracted work history/professional experience text
        jobDescription: job.description || "",
        jobTitle: job.title || "",
        userID: user.id
      };

      // Call dummy API (replace with real API call or supabase.functions.invoke when ready)
      const apiResponse = await dummyEnhanceCvApi(payload);

      // Show enhanced text in editable modal instead of auto download
      const aiEnhanced = apiResponse.enhancedCV || "";
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

  // Helper: extract Work / Professional Experience section from PDF resume URL
  const extractWorkHistoryFromPdf = async (pdfUrl) => {
    try {
      let arrayBuffer = null;

      // 1) Try direct fetch (public URL)
      try {
        const res = await fetch(pdfUrl);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        arrayBuffer = await res.arrayBuffer();
      } catch (fetchErr) {
        console.warn("Direct fetch of resume URL failed:", fetchErr);

        // 2) Try to download via Supabase Storage
        // If resume_file_name is present, try common buckets and the exact filename
        const tryDownloadFromSupabase = async (bucket, path) => {
          try {
            const { data, error } = await supabase.storage.from(bucket).download(path);
            if (error) throw error;
            return await data.arrayBuffer();
          } catch (err) {
            return null;
          }
        };

        // Attempt parsing Supabase public URL pattern:
        // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path/to/file.pdf>
        try {
          const parsed = new URL(pdfUrl);
          const storagePrefix = "/storage/v1/object/public/";
          const idx = parsed.pathname.indexOf(storagePrefix);
          if (idx !== -1) {
            const storagePath = decodeURIComponent(parsed.pathname.substring(idx + storagePrefix.length)); // "<bucket>/<path...>"
            const parts = storagePath.split("/");
            const bucket = parts.shift();
            const path = parts.join("/");
            arrayBuffer = await tryDownloadFromSupabase(bucket, path);
          }
        } catch (err) {
          // ignore URL parse errors
        }

        // 3) If still not found, try fallback buckets and resume_file_name if available
        if (!arrayBuffer && userProfile?.resume_file_name) {
          const candidateBuckets = ["assets", "resumes", "resumes-public", "public"];
          for (const b of candidateBuckets) {
            const ab = await tryDownloadFromSupabase(b, userProfile.resume_file_name);
            if (ab) {
              arrayBuffer = ab;
              break;
            }
          }
        }

        if (!arrayBuffer) {
          throw new Error("Unable to obtain resume PDF bytes via fetch or Supabase storage");
        }
      }

      // Use pdfjs to extract text (disable worker to avoid setup complexity)
      const uint8 = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({ 
        data: uint8,
        disableWorker: true // Disable worker to avoid CORS/version issues
      });
      const pdf = await loadingTask.promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((it) => (it.str ? it.str : ""));
        fullText += strings.join(" ") + "\n";
      }

      const lower = fullText.toLowerCase();

      // Common section headers to detect the work history section
      const headers = [
        "work experience",
        "professional experience",
        "experience",
        "employment history",
        "professional background",
        "career experience"
      ];

      // Find start of the section (pick earliest match)
      let startIndex = -1;
      let foundHeader = "";
      for (const h of headers) {
        const idx = lower.indexOf(h);
        if (idx !== -1 && (startIndex === -1 || idx < startIndex)) {
          startIndex = idx;
          foundHeader = h;
        }
      }

      // If no header found, return the full text as fallback
      if (startIndex === -1) {
        console.warn("No experience header matched — returning full resume text as fallback");
        return fullText.trim();
      }

      // Determine end of section by searching for next common resume section header
      const endHeaders = [
        "education",
        "skills",
        "certifications",
        "projects",
        "summary",
        "contact",
        "profile",
        "objective",
        "languages",
        "references",
        "achievements"
      ];

      let endIndex = fullText.length;
      for (const eh of endHeaders) {
        const idx = lower.indexOf(eh, startIndex + foundHeader.length);
        if (idx !== -1 && idx < endIndex) {
          endIndex = idx;
        }
      }

      const extracted = fullText.substring(startIndex, endIndex).trim();
      // If extraction is very small, return full text to be safe
      if (!extracted || extracted.length < 30) {
        console.warn("Extracted section is empty or too short — returning full resume text as fallback");
        return fullText.trim();
      }
      return extracted;
    } catch (err) {
      console.error("extractWorkHistoryFromPdf error:", err);
      // Return null to let caller fall back to NO_EXTRACTED_TEXT behavior
      return null;
    }
  };

  // Dummy API call — returns a simulated enhanced CV response
  const dummyEnhanceCvApi = async (payload) => {
    try {
      console.log("Dummy enhance payload:", payload);
      // simulate processing delay
      await new Promise((r) => setTimeout(r, 700));

      // Very simple "enhancement" echo for testing — replace with real AI response integration
      const sampleEnhanced = [
        `Enhanced CV for: ${payload.jobTitle}`,
        `User ID: ${payload.userID}`,
        "",
        "Suggested improvements:",
        "- Tailor bullet points to match job description keywords.",
        "- Quantify achievements where possible.",
        "",
        "Extracted Work / Professional Experience (source):",
        payload.resumeText.slice(0, 500) + (payload.resumeText.length > 500 ? "..." : "")
      ].join("\n\n");

      return { enhancedCV: sampleEnhanced };
    } catch (err) {
      console.error("dummyEnhanceCvApi error:", err);
      throw err;
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

      // Open the generated enhanced CV in a new window/tab
      if (publicUrl) {
        window.open(publicUrl, "_blank", "noopener,noreferrer");
      }

      toast.success('Enhanced CV generated, saved and opened in a new window!');
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
