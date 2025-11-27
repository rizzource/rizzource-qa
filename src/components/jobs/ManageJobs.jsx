import { useState, useEffect } from "react";

import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ManageJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Edit/Delete State ---
  const [editJobId, setEditJobId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      const companyIds = memberData.map((cm) => cm.company_id);

      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*, companies(name)")
        .in("company_id", companyIds)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      setJobs(jobsData || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === "open" ? "closed" : "open";
      const { error } = await supabase.from("jobs").update({ status: newStatus }).eq("id", jobId);

      if (error) throw error;

      toast.success(`Job ${newStatus === "open" ? "opened" : "closed"} successfully`);
      fetchJobs();
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status");
    }
  };

  // --- Edit Handler ---
  const handleEditClick = (job) => {
    setEditJobId(job.id);
    setEditForm({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      job_type: job.job_type || "",
      salary_range: job.salary_range || "",
      application_deadline: job.application_deadline ? job.application_deadline.slice(0, 10) : "",
      status: job.status || "open",
    });
  };

  // --- Update Job in Supabase ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          title: editForm.title,
          description: editForm.description,
          location: editForm.location,
          job_type: editForm.job_type,
          salary_range: editForm.salary_range,
          application_deadline: editForm.application_deadline || null,
          status: editForm.status,
        })
        .eq("id", editJobId);

      if (error) throw error;

      toast.success("Job updated successfully!");
      setEditJobId(null);
      setEditForm(null);
      await fetchJobs();
    } catch (error) {
      toast.error("Failed to update job: " + error.message);
    }
  };

  // --- Delete Handler ---
  const handleDeleteJob = async (jobId, closeToast) => {
    setDeletingId(jobId);
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      if (error) throw error;
      toast.success("Job deleted successfully!");
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      if (closeToast) closeToast();
    } catch (error) {
      toast.error("Failed to delete job: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // --- Custom Toast Confirm ---
  const showDeleteConfirm = (jobId) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-destructive">Are you sure you want to delete this job?</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              className="transition-all duration-150 shadow hover:scale-105 focus:ring-2 focus:ring-destructive"
              onClick={() => handleDeleteJob(jobId, closeToast)}
              disabled={deletingId === jobId}
            >
              {deletingId === jobId ? "Deleting..." : "Yes"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="transition-all duration-150 hover:bg-muted/30"
              onClick={closeToast}
            >
              Cancel
            </Button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
        className: "bg-card border border-border shadow-lg",
      },
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading jobs...
      </div>
    );
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
      <div className="space-y-6">
        {/* --- Edit Form --- */}
        {editJobId && editForm && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Edit Job Posting</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="job_type">Job Type</Label>
                    <Input
                      id="job_type"
                      value={editForm.job_type}
                      onChange={(e) => setEditForm({ ...editForm, job_type: e.target.value })}
                      placeholder="e.g., Full-time, Part-time"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="e.g., Remote, New York"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary_range">Salary Range</Label>
                    <Input
                      id="salary_range"
                      value={editForm.salary_range}
                      onChange={(e) => setEditForm({ ...editForm, salary_range: e.target.value })}
                      placeholder="e.g., $80,000 - $120,000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="application_deadline">Application Deadline</Label>
                    <Input
                      id="application_deadline"
                      type="date"
                      value={editForm.application_deadline}
                      onChange={(e) => setEditForm({ ...editForm, application_deadline: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save Changes</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditJobId(null);
                      setEditForm(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* --- Jobs List --- */}
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{job.companies?.name}</p>
                </div>
                <Badge variant={job.status === "open" ? "default" : "primary"} className="px-3 py-1">
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEditClick(job)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={job.status === "open" ? "outline" : "default"}
                  onClick={() => toggleJobStatus(job.id, job.status)}
                >
                  {job.status === "open" ? (
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
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deletingId === job.id}
                  className="bg-red-600 text-white transition-all duration-150"
                  onClick={() => showDeleteConfirm(job.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deletingId === job.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default ManageJobs;
