import { useState, useEffect } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const ManageApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      // Get companies where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const companyIds = memberData.map(cm => cm.company_id);

      // Get jobs for those companies
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .in('company_id', companyIds);

      if (jobsError) throw jobsError;

      const jobIds = jobsData.map(j => j.id);

      // Get applications for those jobs
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*, jobs(title, companies(name))')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;
      
      toast.success('Application status updated');
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No applications received yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{application.applicant_name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Applied for: {application.jobs?.title} at {application.jobs?.companies?.name}
                </p>
              </div>
              <Select 
                defaultValue={application.status}
                onValueChange={(value) => updateApplicationStatus(application.id, value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${application.applicant_email}`} className="text-primary hover:underline">
                  {application.applicant_email}
                </a>
              </div>
              {application.applicant_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{application.applicant_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(application.created_at)}</span>
              </div>
            </div>

            {application.resume_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-2" />
                  View Resume
                </a>
              </Button>
            )}

            <div>
              <h4 className="font-medium mb-2">Cover Letter:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{application.cover_letter}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ManageApplications;
