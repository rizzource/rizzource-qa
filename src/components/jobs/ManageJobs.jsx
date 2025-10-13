import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const ManageJobs = ({ companyId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchJobs();
    }
  }, [companyId]);

  const fetchJobs = async () => {
    if (!companyId) return;

    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*, companies(name)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;
      
      toast.success(`Job ${newStatus === 'open' ? 'opened' : 'closed'} successfully`);
      fetchJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  const deleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No jobs posted yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/jobs/${job.id}`)}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{job.companies?.name}</p>
              </div>
              <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Button 
                size="sm" 
                variant={job.status === 'open' ? 'outline' : 'default'}
                onClick={() => toggleJobStatus(job.id, job.status)}
              >
                {job.status === 'open' ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Close
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Open
                  </>
                )}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteJob(job.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ManageJobs;
