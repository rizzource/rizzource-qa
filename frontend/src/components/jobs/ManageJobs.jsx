import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ManageJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    job_type: '',
    salary_range: '',
    application_deadline: '',
    status: 'open',
  });

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
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
        .select('*, companies(name)')
        .in('company_id', companyIds)
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

  const openEditDialog = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      job_type: job.job_type || '',
      salary_range: job.salary_range || '',
      application_deadline: job.application_deadline || '',
      status: job.status || 'open',
    });
    setEditDialogOpen(true);
  };

  const updateJob = async () => {
    if (!editingJob) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: editForm.title,
          description: editForm.description,
          location: editForm.location,
          job_type: editForm.job_type,
          salary_range: editForm.salary_range,
          application_deadline: editForm.application_deadline || null,
          status: editForm.status,
        })
        .eq('id', editingJob.id);

      if (error) throw error;

      toast.success('Job updated successfully');
      setEditDialogOpen(false);
      setEditingJob(null);
      fetchJobs();
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
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
    <>
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
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
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditDialog(job)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Posting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="e.g., Remote, New York, NY"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_type">Job Type</Label>
                <Input
                  id="job_type"
                  value={editForm.job_type}
                  onChange={(e) => setEditForm({ ...editForm, job_type: e.target.value })}
                  placeholder="e.g., Full-time, Part-time"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary Range</Label>
                <Input
                  id="salary_range"
                  value={editForm.salary_range}
                  onChange={(e) => setEditForm({ ...editForm, salary_range: e.target.value })}
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_deadline">Application Deadline</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={editForm.application_deadline}
                  onChange={(e) => setEditForm({ ...editForm, application_deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateJob}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageJobs;
