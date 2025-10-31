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

      // Download the enhanced CV
      const blob = new Blob([data.enhancedCV], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced-cv-${job.title.replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('CV enhanced successfully! Download started.');
    } catch (error) {
      console.error('Error enhancing CV:', error);
      toast.error('Failed to enhance CV. Please try again.');
    } finally {
      setEnhancingCV(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline specified";
    return new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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

  if (showApplicationForm) {
    return <JobApplicationForm job={job} onCancel={() => setShowApplicationForm(false)} />;
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
                {job.companies?.logo_url ? (
                  <img src={job.companies.logo_url} alt={job.companies.name} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-primary" />
                  </div>
                )}
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
                    <Button onClick={() => navigate('/auth')}>Sign In</Button>
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
                      className="px-6 py-3 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                      onClick={() => {
                        if (job.application_url) {
                          window.open(job.application_url, "_blank");
                        } else {
                          setShowApplicationForm(true);
                        }
                      }}
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
      <Footer />
    </>
  );
};

export default JobDetails;
