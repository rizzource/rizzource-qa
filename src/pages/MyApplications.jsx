import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Briefcase, Calendar, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MyApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchApplications();

    // Set up real-time subscription for application updates
    const channel = supabase
      .channel('job_applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications',
          filter: `applicant_id=eq.${user.id}`
        },
        () => {
          // Refetch applications when any change occurs
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          status,
          created_at,
          jobs (
            id,
            title,
            location,
            job_type,
            companies (
              name
            )
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load your applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const key = String(status || '').toLowerCase().trim();
    const statusConfig = {
      pending: { variant: "secondary", label: "Pending" },
      reviewing: { variant: "default", label: "Reviewing" },
      shortlisted: { variant: "default", label: "Shortlisted" },
      accepted: { variant: "default", label: "Accepted" },
      rejected: { variant: "destructive", label: "Rejected" },
    };

    const config = statusConfig[key] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">My Applications</h1>
              <p className="text-muted-foreground">Track the status of your job applications</p>
            </div>

            {applications.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-16 text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't applied to any jobs yet. Start exploring opportunities!
                  </p>
                  <Button 
                  className="rounded-xl hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
                  onClick={() => navigate('/jobs')}
                  >
                    Browse Jobs
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Application History</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    You have {applications.length} application{applications.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-foreground">Job Title</TableHead>
                          <TableHead className="text-foreground">Company</TableHead>
                          <TableHead className="text-foreground">Location</TableHead>
                          <TableHead className="text-foreground">Type</TableHead>
                          <TableHead className="text-foreground">Applied Date</TableHead>
                          <TableHead className="text-foreground">Status</TableHead>
                          <TableHead className="text-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell className="font-medium text-foreground">
                              {application.jobs?.title || 'N/A'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {application.jobs?.companies?.name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {application.jobs?.location || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {application.jobs?.job_type || 'N/A'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(application.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(application.status)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/jobs/${application.jobs?.id}`)}
                              >
                                View Job
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyApplications;
