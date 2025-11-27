import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  Scale
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { useDispatch, useSelector } from "react-redux";
import { getScrappedJobs } from "@/redux/slices/userApiSlice";
import { useNavigate } from "react-router-dom";
import { setSelectedJob } from "../redux/slices/userApiSlice";

const JobPortal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux data
  const { scrappedJobs, loading } = useSelector(state => state.userApi);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [areaOfLawFilter, setAreaOfLawFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const jobsPerPage = 9;

  // Fetch jobs on mount
  useEffect(() => {
    dispatch(getScrappedJobs());
  }, [dispatch]);

  // Filter logic
  const filteredJobs = scrappedJobs?.filter((job) => {
    const matchesSearch =
      (job.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.company_name || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState =
      !stateFilter || stateFilter === "all"
        ? true
        : job.location?.toLowerCase().includes(stateFilter.toLowerCase());

    const matchesAreaOfLaw =
      !areaOfLawFilter || areaOfLawFilter === "all"
        ? true
        : job.area_of_law === areaOfLawFilter;

    return matchesSearch && matchesState && matchesAreaOfLaw;
  });

  // Areas of law (from backend jobs)
  const areasOfLaw = [...new Set(scrappedJobs?.map((j) => j.area_of_law).filter(Boolean))];

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const resetFilters = () => {
    setSearchQuery("");
    setStateFilter("");
    setAreaOfLawFilter("");
    setCurrentPage(1);
  };

  const getPaginationRange = () => {
    const showPages = 5;
    const halfShow = Math.floor(showPages / 2);
    const pages = [];

    let start = Math.max(1, currentPage - halfShow);
    let end = Math.min(totalPages, currentPage + halfShow);

    if (end - start < showPages - 1) {
      if (start === 1) {
        end = Math.min(totalPages, start + showPages - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - showPages + 1);
      }
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">

          {/* HERO */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Every 1L Summer Job. One Smart Search
            </h1>
            <p className="text-muted-foreground text-lg">
              Rizzource scans firms, job boards, and courts—so you don’t have to.
            </p>
          </div>

          {/* SEARCH & FILTERS */}
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

            <Select
              value={stateFilter}
              onValueChange={(v) => {
                setStateFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="georgia">Georgia</SelectItem>
                <SelectItem value="new york">New York</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="lg"
              onClick={resetFilters}
              className="md:w-48 rounded-xl"
            >
              Reset Filters
            </Button>
          </div>

          {/* JOB LISTING */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No jobs found.</p>
            </div>
          ) : (
            <>
              {/* JOB CARDS */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg cursor-pointer transition"
                    onClick={() => {
                      dispatch(setSelectedJob(job));
                      navigate(`/jobs/${job.id}`);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{job.company_name}</p>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.location && (
                          <Badge variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </Badge>
                        )}
                        {job.area_of_law && (
                          <Badge variant="outline">
                            <Scale className="h-3 w-3 mr-1" />
                            {job.area_of_law}
                          </Badge>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(job.application_deadline)}
                        </span>

                        <Button
                          size="sm"
                          variant="default"
                          className="rounded-xl"
                          onClick={(e) => {
                            dispatch(setSelectedJob(job));
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

              {/* PAGINATION */}
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>

                {getPaginationRange().map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
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
