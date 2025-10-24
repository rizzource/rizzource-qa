export const fetchUsaJobs = async () => {
  const headers = {
    "Host": "data.usajobs.gov",
    "User-Agent": "iqrarasool45@gmail.com",
    "Authorization-Key": "GvBSv4xzUwwMVMhUBR01FPHJqICzBLlMhlFDHkOSujo="
  };

  try {
    // Add query parameters to get more results
    const response = await fetch('https://data.usajobs.gov/api/search?ResultsPerPage=25&LocationName=Georgia', {
      method: 'GET',
      headers: headers
    });
    
    const data = await response.json();
    console.log('USA Jobs API Response:', data); // Debug log
    
    if (!response.ok) {
      throw new Error(`Failed to fetch USA jobs: ${data.ErrorMessage || response.statusText}`);
    }

    return data.SearchResult.SearchResultItems;
  } catch (error) {
    console.error('Error fetching USA jobs:', error);
    throw error;
  }
};