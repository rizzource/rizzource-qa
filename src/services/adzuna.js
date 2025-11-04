export const fetchAdzunaJobs = async () => {
  const app_id = "c8e69105";
  const app_key = "a3f6bdec7f485bc4539612315a205b1f";

  const country = "us";

  const locations = ["Georgia", "New York", "California", "Chicago"];
  const allJobs = [];

  try {
    for (const location of locations) {
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${app_id}&app_key=${app_key}&results_per_page=25&what=law&where=${encodeURIComponent(location)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();
      console.log(`Adzuna API Response for ${location}:`, data);

      if (!response.ok) {
        throw new Error(`Failed to fetch Adzuna jobs for ${location}: ${data.error || response.statusText}`);
      }

      // ✅ Add unique IDs and push results
      const jobs = data.results.map(job => ({
        ...job,
        source_id: job.id || `adzuna_${job.adref || Math.random().toString(36).slice(2)}`,
        location: location // Keep track of which location it came from
      }));

      allJobs.push(...jobs);
    }

    console.log("✅ All Adzuna Jobs Combined:", allJobs);
    return allJobs;
  } catch (error) {
    console.error("❌ Error fetching Adzuna jobs:", error);
    throw error;
  }
};
