export const fetchUsaJobs = async () => {
  const headers = {
    "Host": "data.usajobs.gov",
    "User-Agent": "iqrarasool45@gmail.com", 
    "Authorization-Key": "GvBSv4xzUwwMVMhUBR01FPHJqICzBLlMhlFDHkOSujo="
  };

  const locations = ["Georgia", "New York", "California", "Chicago"];
  const allJobs = [];

  try {
    for (const location of locations) {
      const url = `https://data.usajobs.gov/api/search?ResultsPerPage=25&LocationName=${encodeURIComponent(location)}&Keyword=law`;

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const data = await response.json();
      console.log(`USAJobs API Response for ${location}:`, data);

      if (!response.ok) {
        throw new Error(`Failed to fetch USA jobs for ${location}: ${data.ErrorMessage || response.statusText}`);
      }

      const jobs = data.SearchResult.SearchResultItems.map(item => ({
        ...item,
        source_id: item.MatchedObjectId || `usajobs_${item.PositionID || Math.random().toString(36).slice(2)}`,
        location: location // track where job came from
      }));

      allJobs.push(...jobs);
    }

    console.log("✅ All USA Jobs Combined:", allJobs);
    return allJobs;
  } catch (error) {
    console.error("❌ Error fetching USA jobs:", error);
    throw error;
  }
};
