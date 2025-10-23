import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Briefcase, MapPin, Clock, Building2, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const JobPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [areaOfLawFilter, setAreaOfLawFilter] = useState("");
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 9;

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data: jobsData, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(jobsData || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.company_name && job.company_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesState =
      !stateFilter || stateFilter === "all" || job.location?.toLowerCase().includes(stateFilter.toLowerCase());
    const matchesAreaOfLaw = !areaOfLawFilter || areaOfLawFilter === "all" || job.area_of_law === areaOfLawFilter;
    return matchesSearch && matchesState && matchesAreaOfLaw;
  });

  // Get unique areas of law from jobs
  const areasOfLaw = [...new Set(jobs.map((job) => job.area_of_law).filter(Boolean))];

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline specified";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Calculate pagination values
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Add pagination controls function
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // First, add a reset function near your other state management code
  const resetFilters = () => {
    setSearchQuery("");
    setStateFilter("");
    setAreaOfLawFilter("");
    setCurrentPage(1);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Every 1L Summer Job. One Smart Search</h1>
            <p className="text-muted-foreground text-lg">Rizzource scans firm sites, job boards, and courts live so you don't have to.</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job title, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Commented out location filter
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 md:w-64"
              />
            </div>
            */}
            <Select value={stateFilter} onValueChange={(e) => { setCurrentPage(1); setStateFilter(e);}}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="hover:bg-blue-100 focus:bg-blue-100 cursor-pointer">
                  All States
                </SelectItem>
                <SelectItem value="Georgia" className="hover:bg-blue-100 focus:bg-blue-100 cursor-pointer">
                  Georgia
                </SelectItem>
                <SelectItem value="New York" className="hover:bg-blue-100 focus:bg-blue-100 cursor-pointer">
                  New York
                </SelectItem>
              </SelectContent>
            </Select>
            {/* Replace the existing Reset Filters Button with this */}
            <Button 
              size="lg"
              variant="default"
              onClick={resetFilters}
              className="md:w-48"
            >
              Reset Filters
            </Button>
          </div>

          {/* Job Listings */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No jobs found matching your criteria</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentJobs?.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {/* <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div> */}
                          <div>
                            <CardTitle className="text-lg">{job.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{job.company_name}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.location && (
                          <Badge variant="outline" className="text-xs px-3 py-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </Badge>
                        )}
                        {job.job_type && (
                          <Badge variant="outline" className="text-xs px-3 py-1">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {job.job_type}
                          </Badge>
                        )}
                        {job.area_of_law && (
                          <Badge variant="outline" className="text-xs px-3 py-1">
                            <Scale className="h-3 w-3 mr-1" />
                            {job.area_of_law}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(job.application_deadline)}
                        </span>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/${job.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-2 mt-8 mb-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>

                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index + 1}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobPortal;
