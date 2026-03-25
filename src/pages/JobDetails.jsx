import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Heart,
  Sparkles,
  Zap,
  FileSignature,
  ExternalLink,
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
  Star,
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  Send,
  Target,
} from "lucide-react";
// ✅ UPDATED: Removed saveFavoriteJob, getFavoriteJobs, RemoveFavoriteJob
// These endpoints are not available in the new API
// We now handle favorites with localStorage
import { usePostHog } from 'posthog-js/react';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import ResumeUpload from "@/components/jobs/ResumeUpload";
import JobApplicationForm from "@/components/jobs/JobApplicationForm";

import { toast, Toaster } from "sonner";
import { setTempResume, toggleFavoriteJobThunk } from "@/redux/slices/userApiSlice";
import ResumeEditor from "../components/resume/ResumeEditor";
export default function JobDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const posthog = usePostHog();

  const job = useSelector((state) => state.userApi.selectedJob);
  const user = useSelector((state) => state.userApi.user);
  const tempResume = useSelector((state) => state.userApi.tempResume);

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [headerHeight, setHeaderHeight] = useState(0);

  // Scroll tracking for animations
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track header height to align sticky elements with fixed header
  useEffect(() => {
    const headerEl = document.getElementById("rizz-header");
    if (!headerEl) return;

    const updateHeaderHeight = () => {
      const h = headerEl.getBoundingClientRect().height || 0;
      setHeaderHeight(h);
    };

    updateHeaderHeight();

    const ro = new ResizeObserver(() => updateHeaderHeight());
    ro.observe(headerEl);

    window.addEventListener("resize", updateHeaderHeight, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  // Track job details view on mount
  useEffect(() => {
    if (job) {
      posthog?.capture('job_details_viewed', {
        job_id: job.id,
        job_title: job.jobTitle,
        company: job.firmName,
        job_type: job.jobType,
        location: job.location,
        has_salary: !!job.salary,
        has_deadline: !!job.applicationDeadline,
      });
    }
  }, [job, posthog]);

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

  // ✅ NEW: FAVORITE JOB HANDLER using localStorage
  // Replaces the old saveFavoriteJob and RemoveFavoriteJob thunks
  const handleToggleFavorite = (e) => {
    e?.stopPropagation();

    if (!user) {
      toast.error("Please sign in to save jobs");
      return;
    }

    dispatch(
      toggleFavoriteJobThunk({
        user_id: user.Id,
        job_id: job.job_id,
        is_favorite: !job.is_favorite,
      })
    );

    posthog?.capture("job_favorite_toggled", {
      job_id: job.id,
      job_title: job.jobTitle,
      company: job.firmName,
      is_favorite: !job.is_favorite,
    });
  };


  // Resume Upload
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

  // Navigate to ResumeEditor
  const handleEnhanceCV = () => {
    if (!tempResume?.text) {
      toast.error("Please upload your resume first");
      setShowResumeUpload(true);
      return;
    }

    posthog?.capture('ai_tool_clicked', {
      tool: 'enhance_resume',
      job_id: job.id,
      job_title: job.jobTitle,
      has_resume_uploaded: !!tempResume?.text
    });

    navigate("/resume/editor", {
      state: {
        file: tempResume.file || null,
        extractedText: tempResume.text,
        source_job_id: job.id,
        source_job_title: job.jobTitle
      },
    });
  };

  // Generate Cover Letter
  const handleGenerateCoverLetter = () => {
    posthog?.capture('ai_tool_clicked', {
      tool: 'generate_cover_letter',
      job_id: job.id,
      job_title: job.jobTitle,
      company: job.firmName
    });

    navigate("/cover-letter/generator", {
      state: {
        jobId: job.id,
        title: job.jobTitle,
        jobCompany: job.firmName,
        description: job.jobDescription
      },
    });
  };

  const handleApplyClick = () => {
    const targetUrl = job.jobUrl || job.source;

    if (targetUrl) {
      posthog?.capture('visit_website_clicked', {
        job_id: job.id,
        job_title: job.jobTitle,
        company: job.firmName,
        destination_url: targetUrl
      });

      window.open(targetUrl, "_blank");
      return;
    }
  };

  // Render Upload Screen
  if (showResumeUpload) {
    return (
      <>
        <Header />
        <div style={{ marginTop: "auto" }}>
          <ResumeEditor onBack={() => setShowResumeUpload(false)} />
        </div>
        <Footer />
      </>
    );
  }

  // Render Application Form
  if (showApplicationForm) {
    return (
      <JobApplicationForm
        job={job}
        onCancel={() => setShowApplicationForm(false)}
        resumeText={tempResume?.text || ""}
      />
    );
  }

  const progressOpacity = Math.min(1, scrollY / 300);

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "description", label: "Description" },
    { id: "tools", label: "AI Tools" }
  ];

  // MAIN JOB DETAILS RENDER
  return (
    <>
      <Header />
      <Toaster richColors closeButton position="top-center" />

      <div className="min-h-screen bg-warm-cream text-charcoal">
        {/* Floating Progress Bar */}
        <div
          className="fixed left-0 right-0 h-1 bg-electric-teal z-50 origin-left transition-transform"
          style={{
            top: headerHeight || 80,
            transform: `scaleX(${progressOpacity})`,
            opacity: progressOpacity,
          }}
        />

        {/* Hero Section */}
        <section className="relative pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 overflow-hidden bg-gradient-to-br from-warm-cream via-soft-teal to-warm-cream">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-electric-teal/30 rounded-full blur-[100px] sm:blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-ai-violet/30 rounded-full blur-[100px] sm:blur-[120px]" />
          </div>

          <div className="container mx-auto relative z-10 px-2 sm:px-0">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate("/jobs")}
              className="mb-4 sm:mb-8 font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-transparent hover:text-electric-teal group px-2 sm:px-3 py-1 sm:py-2"
            >
              <ArrowLeft className="mr-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-2" />
              All Positions
            </Button>

            <div className="grid lg:grid-cols-3 gap-6 md:gap-12">
              {/* Main Info */}
              <div className="lg:col-span-2">
                <Badge className="bg-ai-violet/10 text-ai-violet border-ai-violet/20 font-black uppercase tracking-[0.2em] px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6 text-[9px] sm:text-[10px]">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1.5 sm:mr-2" />
                  {job.jobType || "Full-Time"}
                </Badge>

                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-4 sm:mb-6">
                  {job.jobTitle}
                </h1>

                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-electric-teal">
                    {job.firmName}
                  </h2>

                  {/* Favorite Job Button */}
                  <button
                    onClick={handleToggleFavorite}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-charcoal/10 bg-white hover:bg-soft-teal hover:border-electric-teal transition-all group"
                    aria-label="Favorite Job"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${job.is_favorite
                          ? "fill-electric-teal text-electric-teal"
                          : "text-charcoal group-hover:text-electric-teal"
                        }`}
                    />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">
                      {job.is_favorite ? "Saved" : "Save"}
                    </span>
                  </button>

                </div>


                {/* Meta Grid */}
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {job.location && (
                    <div className="flex items-center gap-2 sm:gap-3 bg-surface p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-soft-teal flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-electric-teal" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-warm-gray mb-0.5 sm:mb-1">
                          Location
                        </p>
                        <p className="font-bold text-xs sm:text-sm truncate">{job.location}</p>
                      </div>
                    </div>
                  )}

                  {job.salary && (
                    <div className="flex items-center gap-2 sm:gap-3 bg-surface p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-soft-teal flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-ai-violet" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-warm-gray mb-0.5 sm:mb-1">
                          Comp
                        </p>
                        <p className="font-bold text-xs sm:text-sm truncate">{job.salary}</p>
                      </div>
                    </div>
                  )}

                  {/* {job.applicationDeadline && ( */}
                  <div className="flex items-center gap-2 sm:gap-3 bg-surface p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-soft-teal flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-warm-pop" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-warm-gray mb-0.5 sm:mb-1">
                        Deadline
                      </p>
                      <p className="font-bold text-xs sm:text-sm truncate">{job.applicationDeadline || "Rolling"}</p>
                    </div>
                  </div>
                  {/* )} */}

                  {job.vaultRank && (
                    <div className="flex items-center gap-2 sm:gap-3 bg-surface p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-soft-teal flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-charcoal fill-charcoal" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-warm-gray mb-0.5 sm:mb-1">
                          Vault Rank
                        </p>
                        <p className="font-bold text-xs sm:text-sm truncate">#{job.vaultRank}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {job.areaOfLaw && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {job.areaOfLaw.split(/,|\//).map((tag) => (
                      <Badge
                        key={tag.trim()}
                        variant="outline"
                        className="border-charcoal/20 text-charcoal font-bold uppercase tracking-widest text-[8px] sm:text-[10px] px-2 sm:px-4 py-1 sm:py-2"
                      >
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar Actions */}
              <div className="lg:col-span-1 mt-6 lg:mt-0">
                <Card className="sticky top-20 sm:top-24 md:top-32 border-none bg-charcoal text-warm-cream shadow-2xl rounded-2xl sm:rounded-[2rem] overflow-hidden">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight mb-4 md:mb-6">Take Action</h3>

                    <Button
                      size="lg"
                      className="w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 bg-electric-teal hover:bg-deep-teal text-white font-black uppercase tracking-widest text-xs sm:text-sm shadow-2xl shadow-electric-teal/30 transition-all hover:scale-105 active:scale-95"
                      onClick={handleApplyClick}
                    >
                      <Send className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" />
                      Visit Firm Website
                    </Button>

                    <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full h-12 sm:h-14 rounded-xl border-warm-cream/20 text-warm-cream hover:bg-warm-cream hover:text-charcoal font-bold uppercase tracking-widest text-xs transition-all"
                        onClick={handleEnhanceCV}
                      >
                        <Sparkles className="mr-2 w-4 h-4" />
                        Enhance Resume
                      </Button>

                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full h-12 sm:h-14 rounded-xl border-warm-cream/20 text-warm-cream hover:bg-warm-cream hover:text-charcoal font-bold uppercase tracking-widest text-xs transition-all"
                        onClick={handleGenerateCoverLetter}
                      >
                        <FileSignature className="mr-2 w-4 h-4" />
                        Cover Letter
                      </Button>
                    </div>

                    <div className="pt-6 border-t border-warm-cream/20">
                      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-warm-cream/60 mb-3 sm:mb-4">
                        Quick Stats
                      </p>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-warm-cream/60 font-medium">Status</span>
                          <Badge className="bg-electric-teal/20 text-electric-teal border-none font-black uppercase tracking-widest text-[8px] px-2 py-1">
                            Live
                          </Badge>
                        </div>
                        {job.vaultRank && (
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-warm-cream/60 font-medium">Vault Rank</span>
                            <span className="font-black">#{job.vaultRank}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Navigation */}
        <section
          className="sticky z-40 bg-warm-cream/95 backdrop-blur-xl border-b border-charcoal/5 py-4 sm:py-6 px-4 sm:px-6"
          style={{ top: headerHeight || 80 }}
        >
          <div className="container mx-auto">
            <div className="flex justify-center gap-2 sm:gap-4 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full font-bold uppercase tracking-widest text-[9px] sm:text-[10px] whitespace-nowrap px-2 sm:px-3 py-1 sm:py-1.5 ${activeTab === tab.id
                    ? "bg-electric-teal hover:bg-deep-teal text-white"
                    : "hover:bg-soft-teal hover:text-electric-teal"
                    }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-4xl">
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-4 sm:mb-6">
                    Position Overview
                  </h2>
                  <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
                    <p className="text-xs sm:text-sm md:text-base leading-relaxed font-medium text-warm-gray">
                      {job.jobDescription || "No description available."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {activeTab === "description" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-4 sm:mb-6">
                    Full Description
                  </h2>
                  <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
                    <p className="text-xs sm:text-sm md:text-base leading-relaxed font-medium text-warm-gray whitespace-pre-line">
                      {job.jobDescription || "No detailed description available."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Tools */}
            {activeTab === "tools" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-4 sm:mb-6">
                    AI-Powered Tools
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex gap-3 sm:gap-4 p-3 sm:p-6 bg-surface rounded-xl sm:rounded-2xl">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-electric-teal shrink-0 mt-0.5 sm:mt-1" />
                      <div>
                        <h3 className="font-bold text-sm sm:text-base mb-2">Resume Enhancement</h3>
                        <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">
                          AI-powered resume optimization tailored to this position
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4 p-3 sm:p-6 bg-surface rounded-xl sm:rounded-2xl">
                      <FileSignature className="w-5 h-5 sm:w-6 sm:h-6 text-ai-violet shrink-0 mt-0.5 sm:mt-1" />
                      <div>
                        <h3 className="font-bold text-sm sm:text-base mb-2">Cover Letter Generator</h3>
                        <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">
                          Generate professional cover letters in seconds
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-ai-violet to-electric-teal text-white font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 transition-all"
                      onClick={handleEnhanceCV}
                    >
                      <Sparkles className="mr-3 w-5 h-5" />
                      Try Resume AI
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-2 border-charcoal/20 font-black uppercase tracking-widest text-sm hover:bg-soft-teal hover:border-electric-teal transition-all"
                      onClick={handleGenerateCoverLetter}
                    >
                      <FileSignature className="mr-3 w-5 h-5" />
                      Try Cover Letter AI
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 bg-charcoal text-warm-cream rounded-t-[4rem]">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
              Ready to <span className="text-electric-teal">Apply?</span>
            </h2>
            <p className="text-xl font-bold uppercase tracking-wider text-warm-cream/60 mb-12">
              Don't Wait—Positions Fill Fast
            </p>
            <Button
              size="lg"
              className="h-20 px-16 rounded-[2rem] bg-electric-teal hover:bg-deep-teal text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-electric-teal/30 transition-all hover:scale-110 active:scale-95"
              onClick={handleApplyClick}
            >
              <Send className="mr-3 w-5 h-5" />
              Visit Firm Website
            </Button>
          </div>
        </section>

        <style jsx global>{`
          .prose h3 {
            font-size: 1.5rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.02em;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          .prose p {
            font-size: 1.125rem;
            font-weight: 500;
            color: #78716c;
            line-height: 1.75;
            margin-bottom: 1.5rem;
          }
          .prose ul {
            list-style: none;
            padding-left: 0;
            margin-top: 1rem;
            margin-bottom: 2rem;
          }
          .prose ul li {
            font-size: 1.125rem;
            font-weight: 500;
            color: #78716c;
            line-height: 1.75;
            padding-left: 2rem;
            position: relative;
            margin-bottom: 0.75rem;
          }
          .prose ul li::before {
            content: "→";
            position: absolute;
            left: 0;
            color: #14b8a6;
            font-weight: 900;
          }
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slide-in-from-bottom-4 {
            from {
              transform: translateY(1rem);
            }
            to {
              transform: translateY(0);
            }
          }
          .animate-in {
            animation: fade-in 0.5s ease-out, slide-in-from-bottom-4 0.5s ease-out;
          }
        `}</style>
      </div>

      <Footer />
    </>
  );
};

// export default JobDetails;