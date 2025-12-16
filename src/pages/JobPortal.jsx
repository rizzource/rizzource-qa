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

// ⭐ TRACKING IMPORT ADDED
import { track } from "@/lib/analytics";

const JobPortal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { scrappedJobs, loading, favoriteJobs, user } = useSelector(
    (state) => state.userApi
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [areaOfLawFilter, setAreaOfLawFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const jobsPerPage = 9;

  // ------------------------------
  // FETCH JOBS ON MOUNT
  // ------------------------------
  useEffect(() => {
    if (window.location.href.includes("favoritejobs")) {
      dispatch(getFavoriteJobs());
      track("FavoritesViewed");
    } else {
      dispatch(getScrappedJobs());
      track("JobPortalViewed");
    }
  }, []);

  // Auto-select Georgia AFTER jobs load
  useEffect(() => {
    if ((scrappedJobs?.length > 0 || favoriteJobs?.length > 0) && !stateFilter) {
      setStateFilter("Georgia");
      // Track auto-state assignment
      track("AutoStateFilterApplied", { state: "Georgia" });
    }
  }, [scrappedJobs, favoriteJobs]);

  // ------------------------------------------------------------
  // SMART STATE EXTRACTOR — NO CHANGES MADE
  // ------------------------------------------------------------
  const extractState = (location = "") => {
    if (!location) return null;
    const loc = location.toLowerCase();

    const cityToState = {
      "atlanta": "Georgia",
      "miami": "Florida",
      "boston": "Massachusetts",
      "chicago": "Illinois",
      "new york": "New York",
      "los angeles": "California",
      "san francisco": "California",
      "silicon valley": "California",
      "charlotte": "North Carolina",
      "raleigh": "North Carolina",
      "washington": "District of Columbia",
      "philadelphia": "Pennsylvania",
      "houston": "Texas",
      "dallas": "Texas",
      "ann arbor": "Michigan",
      "grand rapids": "Michigan",
      "columbus": "Ohio",
      "minneapolis": "Minnesota",
      "denver": "Colorado",
      "hartford": "Connecticut",
      "st. louis": "Missouri",
      "des moines": "Iowa"
    };

    for (const city in cityToState) {
      if (loc.includes(city)) return cityToState[city];
    }

    const abbrMap = {
      AL: "Alabama",
      AK: "Alaska",
      AZ: "Arizona",
      AR: "Arkansas",
      CA: "California",
      CO: "Colorado",
      CT: "Connecticut",
      DE: "Delaware",
      FL: "Florida",
      GA: "Georgia",
      HI: "Hawaii",
      ID: "Idaho",
      IL: "Illinois",
      IN: "Indiana",
      IA: "Iowa",
      KS: "Kansas",
      KY: "Kentucky",
      LA: "Louisiana",
      ME: "Maine",
      MD: "Maryland",
      MA: "Massachusetts",
      MI: "Michigan",
      MN: "Minnesota",
      MS: "Mississippi",
      MO: "Missouri",
      MT: "Montana",
      NE: "Nebraska",
      NV: "Nevada",
      NH: "New Hampshire",
      NJ: "New Jersey",
      NM: "New Mexico",
      NY: "New York",
      NC: "North Carolina",
      ND: "North Dakota",
      OH: "Ohio",
      OK: "Oklahoma",
      OR: "Oregon",
      PA: "Pennsylvania",
      RI: "Rhode Island",
      SC: "South Carolina",
      SD: "South Dakota",
      TN: "Tennessee",
      TX: "Texas",
      UT: "Utah",
      VT: "Vermont",
      VA: "Virginia",
      WA: "Washington",
      WV: "West Virginia",
      WI: "Wisconsin",
      WY: "Wyoming",
      DC: "District of Columbia"
    };

    const abbrMatch = location.match(/,\s*([A-Z]{2})$/);
    if (abbrMatch) {
      const abbr = abbrMatch[1];
      return abbrMap[abbr] || null;
    }

    const internationalMap = {
      "kalifornien": "California",
      "georgia": "Georgia",
      "massachusetts": "Massachusetts",
      "illinois": "Illinois",
      "florida": "Florida",
      "texas": "Texas",
      "virginia": "Virginia",
      "minnesota": "Minnesota",
      "ohio": "Ohio",
      "indiana": "Indiana",
      "pennsylvanien": "Pennsylvania",
      "nord-carolina": "North Carolina",
      "vereinigte staaten von amerika": null
    };

    for (const token in internationalMap) {
      if (loc.includes(token)) return internationalMap[token];
    }

    for (const fullName of Object.values(abbrMap)) {
      if (loc.includes(fullName.toLowerCase())) return fullName;
    }

    return null;
  };

  // ------------------------------------------------------------
  // FILTER OUT BAD JOBS (UNCHANGED)
  // ------------------------------------------------------------
  const isBadJob = (job) => {
    if (!job) return true;

    const noTitle = !job.jobTitle || job.jobTitle.trim() === "";
    const noCompany =
      !job.firmName ||
      job.firmName.trim() === "" ||
      job.firmName.toLowerCase() === "no firm name available";

    const badTitle = job.jobTitle?.toLowerCase().includes("no 1l summer internship");
    const badLocation = job.location?.toLowerCase().includes("georgia or new york");

    return noCompany || badTitle || badLocation || noTitle;
  };

  const cleanedScrappedJobs = scrappedJobs?.filter((j) => !isBadJob(j)) || [];
  const cleanedFavoriteJobs = favoriteJobs?.filter((j) => !isBadJob(j)) || [];

  const allJobsCombined = window.location.href.includes("favoritejobs")
    ? cleanedFavoriteJobs
    : cleanedScrappedJobs;

  // ------------------------------------------------------------
  // DYNAMIC STATE LIST (UNCHANGED)
  // ------------------------------------------------------------
  const dynamicStates = Array.from(
    new Set(
      allJobsCombined
        ?.map((j) => extractState(j.location))
        .filter(Boolean)
    )
  ).sort();

  const statesList = ["All States", ...dynamicStates];

  // ------------------------------------------------------------
  // DYNAMIC AREAS OF LAW (UNCHANGED)
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

  // Make this safe when no jobs are present
  const splitAreas = (areasOfLawRaw || []).flatMap((a) =>
    a.split(",").map((s) => s.trim())
  );

  const areasOfLaw = splitAreas.length > 0
    ? ["All Areas of Law", ...Array.from(new Set(splitAreas)).sort()]
    : [];

  // Clear area filter when no areas exist
  useEffect(() => {
    if (splitAreas.length === 0 && areaOfLawFilter) {
      setAreaOfLawFilter("");
    }
  }, [splitAreas, areaOfLawFilter]);

  // ------------------------------------------------------------
  // FILTER LOGIC (UNCHANGED)
  // ------------------------------------------------------------
  const filteredJobs = allJobsCombined.filter((job) => {
    const matchesSearch =
      (job.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.jobDescription || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.firmName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const jobState = extractState(job.location);
    const matchesState =
      !stateFilter || stateFilter === "All States" || jobState === stateFilter;

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
  // PAGINATION + SORTING (UNCHANGED)
  // ------------------------------------------------------------
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const hasDescA = a.jobDescription && a.jobDescription.trim() !== "";
    const hasDescB = b.jobDescription && b.jobDescription.trim() !== "";

    if (hasDescA && !hasDescB) return -1;
    if (!hasDescA && hasDescB) return 1;

    return 0;
  });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  const currentJobs = sortedJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    track("PaginationChanged", { page });
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

  const resetFilters = () => {
    setSearchQuery("");
    setStateFilter("");
    setAreaOfLawFilter("");
    setCurrentPage(1);

    // ⭐ TRACKING
    track("ResetFiltersClicked");
  };

  // ------------------------------------------------------------
  // FAVORITES (+ tracking)
  // ------------------------------------------------------------
  const addFavoriteJob = async (jobId) => {
    if (!user) {
      toast.error("Please sign in to save favorite jobs");
      return;
    }

    track("FavoriteAdded", { jobId });

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

    track("FavoriteRemoved", { jobId });

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
  // UI STARTS HERE (ONLY tracking added)
  // ------------------------------------------------------------
  return (
    <>
      <Toaster richColors closeButton position="top-center" />

      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
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
                Every 1L Law-Firm Role. One Smart Search.
              </h1>
              <p className="text-muted-foreground text-lg">
                Currently serving Georgia and New York —{" "}
                {user && "click on job details to "}explore AI résumé and cover-letter tools {!user ? "when you join ✨" : "✨"}
                {/* Rizzource scans firms, job boards, and courts—so you don’t have to. */}
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  track("JobSearchPerformed", { query: e.target.value });
                }}
                className="pl-10"
              />
            </div>

            {/* STATE SELECT */}
            <Select
              value={stateFilter}
              onValueChange={(v) => {
                setStateFilter(v);
                setCurrentPage(1);
                track("StateFilterChanged", { state: v });
              }}
            >
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="max-h-64 overflow-y-auto">
                {statesList.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* AREA OF LAW SELECT */}
            {splitAreas.length > 0 && (
              <Select
                value={areaOfLawFilter}
                onValueChange={(v) => {
                  setAreaOfLawFilter(v);
                  setCurrentPage(1);
                  track("AreaOfLawFilterChanged", { area: v });
                }}
              >
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Area of Law" />
                </SelectTrigger>
                <SelectContent className="max-h-74 overflow-y-auto">
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
            )}

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

                      // ⭐ TRACK JOB VIEW
                      track("JobViewed", {
                        jobId: job.id,
                        title: job.jobTitle,
                        firm: job.firmName,
                      });

                      navigate(`/jobs/${job.id}`);
                    }}
                  >
                    <CardHeader className="relative">
                      <CardTitle className="text-lg">{job.jobTitle}</CardTitle>
                      <p className="text-sm text-muted-foreground">{job.firmName || "Not Specified"}</p>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {job.jobDescription || "No description available."}
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
                          {job.applicationDeadline || "Not Specified"}
                        </span>

                        <Button
                          size="sm"
                          variant="default"
                          className="rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setSelectedJob(job));

                            // ⭐ TRACK VIEW DETAILS BUTTON
                            track("JobDetailsViewed", {
                              jobId: job.id,
                              title: job.jobTitle,
                            });

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
      </div >

      <Footer />
    </>
  );
};

export default JobPortal;
