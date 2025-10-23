import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, Building2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobApplicationForm from "@/components/jobs/JobApplicationForm";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    if (user) {
      checkIfApplied();
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

              <div className="pt-6 border-t">
                {/* Commented out sign-in requirement
                {!user ? (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Please sign in to apply for this job</p>
                    <Button onClick={() => navigate('/auth')}>Sign In</Button>
                  </div>
                ) : hasApplied ? (
                  <div className="text-center">
                    <p className="text-green-600 font-medium">You have already applied for this position</p>
                  </div>
                ) : (
                */}
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
                    Apply Now
                  </Button>
                </div>
                {/* )} */}
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
