// src/pages/JobDetails.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Heart } from "lucide-react";
import { saveFavoriteJob, getFavoriteJobs } from "@/redux/slices/userApiSlice";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
  Sparkles,
  FileSignature,
  ExternalLink
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import ResumeUpload from "@/components/jobs/ResumeUpload";
import JobApplicationForm from "@/components/jobs/JobApplicationForm";

import { toast, Toaster } from "sonner";
import { setTempResume } from "@/redux/slices/userApiSlice";
import ResumeEditor from "../components/resume/ResumeEditor";
import { RemoveFavoriteJob } from "../redux/slices/userApiSlice";

const JobDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const job = useSelector((state) => state.userApi.selectedJob);
  const user = useSelector((state) => state.userApi.user);
  const tempResume = useSelector((state) => state.userApi.tempResume);

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  // OLD Enhance CV states (kept for safety, not removed)
  const [enhancing, setEnhancing] = useState(false);
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const [enhancedText, setEnhancedText] = useState("");
  const [editableText, setEditableText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!job) navigate("/jobs");
  }, [job, navigate]);

  if (!job) return null;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      : "";
  // -----------------------------
  // FAVORITE JOB HANDLER
  // -----------------------------
  const toggleFavorite = async (jobId) => {
    if (!user) {
      toast.error("Please sign in to save favorite jobs");
      return;
    }

    try {
      const result = await dispatch(saveFavoriteJob({ jobId }));

      if (result.error) {
        toast.error(result.error.message || "Failed to update favorite");
        return;
      }

      toast.success("Updated your favorites");
      window.location.reload();
    } catch (err) {
      toast.error("Could not update favorite job");
    }
  };
  const deleteFavoriteJob = async (jobId) => {
    if (!user) {
      toast.error("Please sign in to save favorite jobs");
      return;
    }
    try {
      const result = await dispatch(RemoveFavoriteJob({ jobId }));

      if (result.error) {
        toast.error("Failed to remove from favorites. Please try again.");
        return;
      }

      toast.success("Updated your favorites!");

      window.location.reload();
    } catch (err) {
      console.error("Favorite job error:", err);
      toast.error("Something went wrong while saving your job.");
    }
  };
  // -----------------------------
  // Resume Upload
  // -----------------------------
  const handleResumeUpload = (fileOrUrl, extractedText) => {
    dispatch(
      setTempResume({
        file: typeof fileOrUrl === "string" ? null : fileOrUrl,
        text: extractedText || "",
        url: typeof fileOrUrl === "string" ? fileOrUrl : "",
      })
    );

    toast.success("Resume uploaded for this job");
    setShowResumeUpload(false);
  };

  // -----------------------------
  // NEW: Navigate to ResumeEditor
  // -----------------------------
  const handleEnhanceCV = () => {
    if (!tempResume?.text) {
      toast.error("Please upload your resume first");
      setShowResumeUpload(true);
      return;
    }

    // NEW — Navigate to ResumeEditor with extracted text
    navigate("/resume/editor", {
      state: {
        file: tempResume.file || null,
        extractedText: tempResume.text,
      },
    });
  };

  // -----------------------------
  // NEW: Generate Cover Letter
  // -----------------------------
  const handleGenerateCoverLetter = () => {
    navigate("/cover-letter/generator"
      , {
        state: {
          jobId: job.id,
          title: job.jobTitle,
          jobCompany: job.firmName,
          description: job.jobDescription
        },
      }
    );
  };

  const handleApplyClick = () => {
    if (job.jobUrl) {
      window.open(job.jobUrl, "_blank");
      return;
    } else if (job.source) {
      window.open(job.jobUrl, "_blank");
    }
    // setShowApplicationForm(true);
  };

  // -----------------------------
  // Render Upload Screen
  // -----------------------------
  if (showResumeUpload) {
    return (
      <>
        <Header />
        <div style={{ marginTop: "auto" }}><ResumeEditor onBack={() => setShowResumeUpload(false)} /></div>
        <Footer />
      </>
    );
  }

  // -----------------------------
  // Render Application Form
  // -----------------------------
  if (showApplicationForm) {
    return (
      <JobApplicationForm
        job={job}
        onCancel={() => setShowApplicationForm(false)}
        resumeText={tempResume?.text || ""}
      />
    );
  }

  // -----------------------------
  // MAIN JOB DETAILS RENDER
  // -----------------------------
  return (
    <>
      <Header />
      <Toaster richColors closeButton position="top-center" />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/jobs")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-4 mb-4 relative">

                {/* ❤️ Favorite Button */}
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    job?.isFav ? deleteFavoriteJob(job.id) :
                      toggleFavorite(job.id);
                  }}
                  className={
                    "absolute top-0 right-0 p-2 rounded-full transition hover:bg-muted/70 " +
                    (job.isFav ? "text-red-500" : "text-muted-foreground")
                  }
                >
                  <Heart
                    className={
                      "h-6 w-6 transition " + (job.isFav ? "fill-red-500" : "")
                    }
                  />
                </button> */}

                <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>

                <div className="flex-1">
                  <CardTitle className="text-3xl">{job.jobTitle}</CardTitle>
                  <p className="text-xl text-muted-foreground">{job.firmName}</p>
                </div>
              </div>


              <div className="flex flex-wrap gap-3">
                {job.location && (
                  <Badge variant="outline">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </Badge>
                )}

                {job.jobType && (
                  <Badge variant="outline">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {job.jobType}
                  </Badge>
                )}

                {job.salary && (
                  <Badge variant="outline">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.salary}
                  </Badge>
                )}

                {job.applicationDeadline && (
                  <Badge variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    {job.applicationDeadline}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {job.jobDescription || "No description available."}
                </p>
              </div>

              <div className="pt-6 border-t border-border/60 space-y-5">
                {user && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {/* Enhance CV Button */}
                    <Button
                      variant="outline"
                      size="lg"
                      className="relative w-full sm:w-auto overflow-hidden group px-6 py-3 text-sm font-semibold rounded-xl
                             bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0
                             shadow-md shadow-violet-500/25
                             transition-all duration-300 ease-out
                             hover:shadow-lg hover:shadow-violet-500/30 hover:scale-[1.02]
                             active:scale-[0.98]"
                      onClick={handleEnhanceCV}
                    >
                      {/* Shine effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enhance CV with AI
                    </Button>

                    {/* Generate Cover Letter Button */}
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-xl
                             border-border/60 bg-background
                             transition-all duration-200
                             hover:bg-primary/5 hover:border-primary/30 hover:text-primary
                             active:scale-[0.98]"
                      onClick={handleGenerateCoverLetter}
                    >
                      <FileSignature className="h-4 w-4 mr-2" />
                      Generate Cover Letter
                    </Button>
                  </div>
                )}

                {!user ? (
                  <div className="text-center py-4 px-6 bg-muted/30 rounded-xl border border-border/40">
                    <p className="text-muted-foreground mb-3 text-sm">Please sign in to apply for this position</p>
                    <Button
                      className="rounded-xl px-6 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => () => navigate("/auth")}
                    >
                      Sign In
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      className="px-8 py-3 text-sm font-semibold rounded-xl
                             bg-primary text-primary-foreground
                             shadow-md shadow-primary/25
                             transition-all duration-200
                             hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]
                             active:scale-[0.98]"
                      onClick={handleApplyClick}
                    >
                      {job.jobUrl || job.source ? (
                        <>
                          Visit Website
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        "Apply Now"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Keep your old Enhanced Modal exactly as-is */}
      {showEnhancedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* ... unchanged modal code ... */}
        </div>
      )}

      <Footer />
    </>
  );
};

export default JobDetails;
