import { supabase } from "@/integrations/supabase/client";

export const saveJobsToDatabase = async (jobs, source) => {
  try {
    if (!jobs || jobs.length === 0) {
      console.log('No jobs to save');
      return;
    }

    // Transform job data depending on source
    const transformedJobs = jobs.map(job => {
      if (source === 'usajobs') {
        const j = job.MatchedObjectDescriptor;
        return {
          title: j.PositionTitle,
          description: j.UserArea?.Details?.JobSummary || 'No description available',
          company_name: j.DepartmentName,
          location: j.PositionLocationDisplay,
          job_type: j.PositionSchedule?.[0]?.Name || 'Not specified',
          area_of_law: 'Government',
          application_deadline: j.ApplicationCloseDate,
          status: 'open',
          external_job_id: j.PositionID,
          source: 'usajobs'
        };
      }

      else if (source === 'adzuna') {
        return {
          title: job.title,
          description: job.description,
          company_name: job.company?.display_name || 'Unknown',
          location: job.location?.display_name || 'Unknown',
          job_type: job.contract_time || 'Not specified',
          area_of_law: 'Law',
          application_deadline: job.created || null, 
          status: 'open',
          external_job_id: job.id,
          source: 'adzuna'
        };
      }

      // Fallback for any future APIs
      else {
        return {
          title: job.title || 'Untitled',
          description: job.description || 'No description available',
          company_name: job.company_name || 'Unknown',
          location: job.location || 'Unknown',
          job_type: job.job_type || 'Not specified',
          area_of_law: job.area_of_law || 'General',
          application_deadline: job.application_deadline || null,
          status: job.status || 'open',
          external_job_id: job.external_job_id || crypto.randomUUID(),
          source
        };
      }
    });

    // For each job, first check if it already exists
    for (const job of transformedJobs) {
      // Check for existing job using external_job_id
      const { data: existingJobs, error: searchError } = await supabase
        .from('jobs')
        .select('id')
        .eq('external_job_id', job.external_job_id)
        .eq('source', source);

      if (searchError) {
        console.error('Error checking for existing job:', searchError);
        continue;
      }

      // If no existing jobs found (array is empty), insert the new job
      if (!existingJobs || existingJobs.length === 0) {
        const { error: insertError } = await supabase
          .from('jobs')
          .insert([{
            ...job,
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Error inserting job:', insertError);
        } else {
          console.log(`New job saved: ${job.title}`);
        }
      } else {
        console.log(`Job already exists: ${job.title}`);
      }
    }
  } catch (error) {
    console.error('Error in saveJobsToDatabase:', error);
    throw error;
  }
};
