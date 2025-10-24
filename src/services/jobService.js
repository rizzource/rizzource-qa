import { supabase } from "@/integrations/supabase/client";

export const saveJobsToDatabase = async (usaJobs) => {
  try {
    const transformedJobs = usaJobs.map(job => ({
      title: job.MatchedObjectDescriptor.PositionTitle,
      description: job.MatchedObjectDescriptor.UserArea.Details.JobSummary,
      company_name: job.MatchedObjectDescriptor.DepartmentName,
      location: job.MatchedObjectDescriptor.PositionLocationDisplay,
      job_type: job.MatchedObjectDescriptor.PositionSchedule[0].Name,
      area_of_law: 'Government', // You might want to map this differently
      application_deadline: job.MatchedObjectDescriptor.ApplicationCloseDate,
      status: 'open',
      external_job_id: job.MatchedObjectDescriptor.PositionID,
      source: 'usajobs'
    }));

    const { data, error } = await supabase
      .from('jobs')
      .upsert(transformedJobs, {
        onConflict: 'external_job_id',
        returning: true
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving jobs to database:', error);
    throw error;
  }
};