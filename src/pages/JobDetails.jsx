// src/pages/JobDetails.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

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
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import ResumeUpload from "@/components/jobs/ResumeUpload";
import JobApplicationForm from "@/components/jobs/JobApplicationForm";

import { toast } from "sonner";
import { setTempResume } from "@/redux/slices/userApiSlice";

const JobDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const job = useSelector((state) => state.userApi.selectedJob);
  const user = useSelector((state) => state.userApi.user);
  const tempResume = useSelector((state) => state.userApi.tempResume);

  // UI
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  // AI Enhancer
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
    d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

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
  // AI Enhancement
  // -----------------------------
  const handleEnhanceCV = async () => {
    if (!tempResume?.text) {
      toast.error("Please upload your resume first");
      setShowResumeUpload(true);
      return;
    }

    setEnhancing(true);

    await new Promise((r) => setTimeout(r, 600)); // simulate AI

    const suggestion =
      `Enhanced CV for ${job.title}\n\n` +
      tempResume.text.slice(0, 500) +
      (tempResume.text.length > 500 ? "…" : "");

    setEnhancedText(suggestion);
    setEditableText(suggestion);
    setShowEnhancedModal(true);
    setEnhancing(false);
  };

  const handleApplyClick = () => {
    if (job.application_url) {
      window.open(job.application_url, "_blank");
      return;
    }
    setShowApplicationForm(true);
  };

  // -----------------------------
  // Render Modes
  // -----------------------------
  if (showResumeUpload) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-16">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Button variant="ghost" onClick={() => setShowResumeUpload(false)} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Job Details
            </Button>

            <ResumeUpload onUploadComplete={handleResumeUpload} />
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
  // MAIN RENDER
  // -----------------------------
  return (
    <>
      <Header />

      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/jobs")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>

                <div className="flex-1">
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                  <p className="text-xl text-muted-foreground">{job.company}</p>
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

                {job.deadline && (
                  <Badge variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    Apply by {formatDate(job.deadline)}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
              </div>

              <div className="pt-6 border-t space-y-4">
                {user && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-6 py-3 text-base font-semibold rounded-xl"
                      onClick={handleEnhanceCV}
                    // disabled={enhancingCV || !userProfile.resume_url}
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      {'Enhance CV with AI'}
                    </Button>
                  </div>

                )}

                {!user ? (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">Please sign in to apply</p>
                    <Button onClick={() => navigate("/auth")}>Sign In</Button>
                  </div>
                ) : !tempResume ? (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">Please upload your resume to apply</p>
                    <Button onClick={() => setShowResumeUpload(true)}>Upload Resume</Button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Button size="lg"
                      className="px-6 py-3 text-base font-semibold rounded-xl hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300" onClick={handleApplyClick}>
                      {job.application_url ? "Visit Website" : "Apply Now"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Enhanced Modal */}
      {showEnhancedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEnhancedModal(false)}
          />

          <div className="relative z-10 bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl mx-4">
            <div className="flex justify-between mb-3">
              <h3 className="text-lg font-semibold">AI Suggested CV</h3>
              <button
                className="text-muted-foreground"
                onClick={() => setShowEnhancedModal(false)}
              >
                ×
              </button>
            </div>

            <textarea
              className="w-full h-64 border rounded p-3 bg-surface resize-y"
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={async () => {
                await navigator.clipboard.writeText(editableText || "");
                setCopied(true);
                toast.success("Copied!");
                setTimeout(() => setCopied(false), 2000);
              }}>
                {copied ? "Copied!" : "Copy Text"}
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
