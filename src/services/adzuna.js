export const fetchAdzunaJobs = async () => {
  const app_id = "c8e69105";  
  const app_key = "a3f6bdec7f485bc4539612315a205b1f"; 

  const country = "gb"; 
  const baseUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${app_id}&app_key=${app_key}&results_per_page=25&what=law`;

  try {
    const response = await fetch(baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    console.log("Adzuna API Response:", data);

    if (!response.ok) {
      throw new Error(`Failed to fetch Adzuna jobs: ${data.error || response.statusText}`);
    }

    return data.results.map(job => ({
      ...job,
      source_id: job.id || `adzuna_${job.adId}`, // Add a unique identifier
      // ...other job properties
    }));
  } catch (error) {
    console.error("Error fetching Adzuna jobs:", error);
    throw error;
  }
};
