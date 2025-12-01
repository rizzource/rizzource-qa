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
  Scale,
  Heart
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { useDispatch, useSelector } from "react-redux";
import { getScrappedJobs } from "@/redux/slices/userApiSlice";
import { useNavigate } from "react-router-dom";
import { getFavoriteJobs, RemoveFavoriteJob, saveFavoriteJob, setSelectedJob } from "../redux/slices/userApiSlice";
import { toast, Toaster } from "sonner";

const JobPortal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux data
  const { scrappedJobs, loading, favoriteJobs } = useSelector(
    (state) => state.userApi
  );

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [areaOfLawFilter, setAreaOfLawFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const user = useSelector((state) => state.userApi.user);

  const jobsPerPage = 9;

  // Fetch jobs on mount
  useEffect(() => {
    if (window.location.href.includes("favoritejobs")) {
      dispatch(getFavoriteJobs());
    } else {
      dispatch(getScrappedJobs());
    }
  }, [dispatch]);

  // ------------------------------------------------------------
  // 1️⃣ FILTER OUT BAD PLACEHOLDER JOBS
  // ------------------------------------------------------------

  const isBadJob = (job) => {
    if (!job) return true;

    const badTitle = job.title?.toLowerCase().includes("no 1l summer internship");
    const badLocation = job.location?.toLowerCase().includes("georgia or new york");
    const badCompany = job.company?.toLowerCase().includes("no firm name available");

    return badTitle || badLocation || badCompany;
  };

  const cleanedScrappedJobs = scrappedJobs?.filter((job) => !isBadJob(job)) || [];
  const cleanedFavoriteJobs = favoriteJobs?.filter((job) => !isBadJob(job)) || [];

  // ------------------------------------------------------------
  // 2️⃣ DYNAMIC STATE LIST
  // ------------------------------------------------------------

  const extractState = (location = "") => {
    const lower = location.toLowerCase();

    // Direct DC mapping
    if (lower.includes("washington, d.c.") || lower.includes("dc")) return "District of Columbia";

    // Look for ", XX"
    const stateAbbrMatch = location.match(/,\s*([A-Z]{2})$/);
    if (stateAbbrMatch) {
      const abbr = stateAbbrMatch[1];
      const map = {
        GA: "Georgia",
        NY: "New York",
        CA: "California",
        TX: "Texas",
        IL: "Illinois",
        MA: "Massachusetts",
        VA: "Virginia",
        PA: "Pennsylvania",
        WA: "Washington",
        FL: "Florida"
      };
      return map[abbr] || abbr;
    }

    const knownStates = [
      "Georgia",
      "New York",
      "California",
      "Texas",
      "Illinois",
      "Massachusetts",
      "Virginia",
      "Pennsylvania",
      "Washington",
      "Florida",
      "District of Columbia"
    ];

    for (const s of knownStates) {
      if (lower.includes(s.toLowerCase())) return s;
    }

    return null;
  };

  const allJobsCombined = window.location.href.includes("favoritejobs")
    ? cleanedFavoriteJobs
    : cleanedScrappedJobs;

  const dynamicStates = Array.from(
    new Set(
      allJobsCombined
        ?.map((j) => extractState(j.location))
        .filter(Boolean)
    )
  ).sort();

  const statesList = ["All States", ...dynamicStates];

  // ------------------------------------------------------------
  // 3️⃣ DYNAMIC AREAS OF LAW (split + dedupe + clean)
  // ------------------------------------------------------------

  const areasOfLawRaw = allJobsCombined
    ?.map((j) => j.areaOfLaw)
    .filter(Boolean)
    .filter(
      (a) =>
        a.toLowerCase() !== "no area of law specified" &&
        a.toLowerCase() !== "n/a" &&
        a.toLowerCase() !== "none"
    );

  const splitAreas = areasOfLawRaw.flatMap((a) =>
    a.split(",").map((s) => s.trim())
  );

  const areasOfLaw = [
    "All Areas of Law",
    ...Array.from(new Set(splitAreas)).sort(),
  ];

  // ------------------------------------------------------------
  // 4️⃣ FILTERING LOGIC
  // ------------------------------------------------------------

  const filteredJobs = allJobsCombined.filter((job) => {
    const matchesSearch =
      (job.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.jobDescription || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.company || "").toLowerCase().includes(searchQuery.toLowerCase());

    // State matching
    const jobState = extractState(job.location);
    const matchesState =
      !stateFilter ||
      stateFilter === "All States" ||
      jobState === stateFilter;

    // Area of Law matching (OR logic for comma-separated categories)
    const jobAreas = job.areaOfLaw
      ?.split(",")
      .map((a) => a.trim().toLowerCase()) || [];

    const matchesArea =
      !areaOfLawFilter ||
      areaOfLawFilter === "All Areas of Law" ||
      jobAreas.includes(areaOfLawFilter.toLowerCase());

    return matchesSearch && matchesState && matchesArea;
  });

  // ------------------------------------------------------------
  // 5️⃣ PAGINATION
  // ------------------------------------------------------------

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

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

  const resetFilters = () => {
    setSearchQuery("");
    setStateFilter("");
    setAreaOfLawFilter("");
    setCurrentPage(1);
  };

  const addFavoriteJob = async (jobId) => {
    if (!user) {
      toast.error("Please sign in to save favorite jobs");
      return;
    }
    try {
      const result = await dispatch(saveFavoriteJob({ jobId }));

      if (result.error) {
        toast.error("Failed to add to favorites. Please try again.");
        return;
      }

      toast.success("Updated your favorites!");

      if (window.location.href.includes("favoritejobs")) {
        dispatch(getFavoriteJobs());
      } else {
        dispatch(getScrappedJobs());
      }
    } catch (err) {
      console.error("Favorite job error:", err);
      toast.error("Something went wrong while saving your job.");
    }
  };
  const deleteFavoriteJob = async (jobId) => {
    if (!user) {
      toast.error("Please sign in to save favorite jobs");
      return;
    }
    try {
      const result = await dispatch(RemoveFavoriteJob({ jobId }));

      if (result.error) {
        toast.error("Failed to remove from favorites. Please try again.");
        return;
      }

      toast.success("Updated your favorites!");

      if (window.location.href.includes("favoritejobs")) {
        dispatch(getFavoriteJobs());
      } else {
        dispatch(getScrappedJobs());
      }
    } catch (err) {
      console.error("Favorite job error:", err);
      toast.error("Something went wrong while saving your job.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ------------------------------------------------------------
  // 6️⃣ UI
  // ------------------------------------------------------------

  return (
    <>
      <Toaster richColors closeButton position="top-center" />

      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* HERO */}
          {window.location.href.includes("favoritejobs") ? (
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Favorites at a Glance
              </h1>
              <p className="text-muted-foreground text-lg">
                Review, prioritize, and apply faster with your curated job list.
              </p>
            </div>
          ) : (
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Every 1L Summer Job. One Smart Search
              </h1>
              <p className="text-muted-foreground text-lg">
                Rizzource scans firms, job boards, and courts—so you don’t have to.
              </p>
            </div>
          )}

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

            {/* STATE SELECT */}
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
                {statesList.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* AREA OF LAW SELECT */}
            <Select
              value={areaOfLawFilter}
              onValueChange={(v) => {
                setAreaOfLawFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Area of Law" />
              </SelectTrigger>
              <SelectContent>
                {areasOfLaw.map((area) => (
                  <SelectItem
                    key={area}
                    value={area}
                    className="max-w-[260px] truncate"
                  >
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="lg" onClick={resetFilters} className="md:w-48 rounded-xl">
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
                    <CardHeader className="relative">
                      {/* ❤️ Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          job?.isFav ? deleteFavoriteJob(job.id) :
                            addFavoriteJob(job.id);
                        }}
                        className={
                          "absolute top-2 right-2 p-2 rounded-full transition hover:bg-muted/70 " +
                          (job.isFav ? "text-red-500" : "text-muted-foreground")
                        }
                      >
                        <Heart
                          className={
                            "h-5 w-5 transition " +
                            (job.isFav ? "fill-red-500" : "")
                          }
                        />
                      </button>

                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {job.jobDescription}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.location && (
                          <Badge variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </Badge>
                        )}
                        {job.areaOfLaw && (
                          <Badge variant="outline">
                            <Scale className="h-3 w-3 mr-1" />
                            {job.areaOfLaw}
                          </Badge>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.applicationDeadline}
                        </span>

                        <Button
                          size="sm"
                          variant="default"
                          className="rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
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
