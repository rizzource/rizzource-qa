import { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom'; 
import { useAuth } from "@/components/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  UserCheck,
  MessageSquare,
  Activity,
  Shield,
  FileSpreadsheet,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Scale,
  BookOpen,
  Briefcase,
  Gavel,
  FileText,
  GraduationCap,
  Calendar,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";

export const AdminDashboard = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    mentees: 0,
    mentors: 0,
    events: 0,
    exports: 0,
    outlines: 0, // <-- add outlines stat
  });

  // Pagination state for each table
  const [menteesData, setMenteesData] = useState({ data: [], total: 0, loading: false });
  const [mentorsData, setMentorsData] = useState({ data: [], total: 0, loading: false });
  const [outlinesData, setOutlinesData] = useState({ data: [], total: 0, loading: false }); // <-- outlines state
  // const [feedbackData, setFeedbackData] = useState({ data: [], total: 0, loading: false });
  
  const [menteesPage, setMenteesPage] = useState(1);
  const [mentorsPage, setMentorsPage] = useState(1);
  const [outlinesPage, setOutlinesPage] = useState(1); // <-- outlines page
  // const [feedbackPage, setFeedbackPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [exportingTable, setExportingTable] = useState("");
  const [activeSection, setActiveSection] = useState(0); // 0=mentees,1=mentors,2=events,3=outlines
  const [eventsData, setEventsData] = useState({ data: [], total: 0, loading: false });
  const [eventsPage, setEventsPage] = useState(1);
  const [showEventForm, setShowEventForm] = useState(false);
  const navigate = useNavigate();
  const topRef = useRef(null);

  // Scroll to top function
  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Update handlePrev and handleNext to scroll to top
  const handlePrev = () => {
    setActiveSection((prev) => (prev > 0 ? prev - 1 : 3));
    scrollToTop();
  };

  const handleNext = () => {
    setActiveSection((prev) => (prev < 3 ? prev + 1 : 0));
    scrollToTop();
  };

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    month: '',
    year: new Date().getFullYear(),
    description: '',
    location: '',
    time: ''
  });

  const months = [
    { value: 'Jan', index: 0 },
    { value: 'Feb', index: 1 },
    { value: 'Mar', index: 2 },
    { value: 'Apr', index: 3 },
    { value: 'May', index: 4 },
    { value: 'Jun', index: 5 },
    { value: 'Jul', index: 6 },
    { value: 'Aug', index: 7 },
    { value: 'Sep', index: 8 },
    { value: 'Oct', index: 9 },
    { value: 'Nov', index: 10 },
    { value: 'Dec', index: 11 }
  ];

  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (userProfile && !isAdmin()) {
      navigate("/");
      return;
    }
    fetchStats();
    fetchAllData();
  }, [user, userProfile, navigate, isAdmin]);

  const fetchStats = async () => {
    if (!isAdmin()) return;
    try {
      const [
        menteesResponse,
        mentorsResponse,
        exportsResponse,
        eventsResponse,
        outlinesResponse,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "mentee"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "mentor"),
        supabase.from("data_exports").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("outlines").select("*", { count: "exact", head: true }), // outlines
      ]);
      
      setStats({
        mentees: menteesResponse.count || 0,
        mentors: mentorsResponse.count || 0,
        events: eventsResponse.count || 0,
        exports: exportsResponse.count || 0,
        outlines: outlinesResponse.count || 0, // outlines
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch dashboard stats");
    }
  };

  // --- Add fetchOutlines function ---
  const fetchOutlines = async (page) => {
    if (!isAdmin()) return;
    setOutlinesData(prev => ({ ...prev, loading: true }));
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      // Use .select("*", { count: "exact" }) for both data and count
      const { data, count, error } = await supabase
        .from("outlines")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setOutlinesData({
        data: data || [],
        total: count || 0,
        loading: false,
      });
      setOutlinesPage(page);
    } catch (error) {
      console.error("Error fetching outlines:", error);
      setOutlinesData(prev => ({ ...prev, loading: false }));
      toast.error("Failed to fetch outlines data");
    }
  };

  const fetchAllData = async () => {
    if (!isAdmin()) return;
    setLoading(true); // Ensure loading is set to true at the start
    try {
      await Promise.all([
        fetchMentees(1),
        fetchMentors(1),
        fetchEvents(1),
        fetchOutlines(1), // outlines
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMentees = async (page) => {
    if (!isAdmin()) return;
    setMenteesData(prev => ({ ...prev, loading: true }));
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("role", "mentee")
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      setMenteesData({
        data: data || [],
        total: count || 0,
        loading: false,
      });
      setMenteesPage(page);
    } catch (error) {
      console.error("Error fetching mentees:", error);
      setMenteesData(prev => ({ ...prev, loading: false }));
      toast.error("Failed to fetch mentees data");
    }
  };

  const fetchMentors = async (page) => {
    if (!isAdmin()) return;
    setMentorsData(prev => ({ ...prev, loading: true }));
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("role", "mentor")
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      setMentorsData({
        data: data || [],
        total: count || 0,
        loading: false,
      });
      setMentorsPage(page);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      setMentorsData(prev => ({ ...prev, loading: false }));
      toast.error("Failed to fetch mentors data");
    }
  };

  // const fetchFeedback = async (page) => {
  //   if (!isAdmin()) return;
  //   setFeedbackData(prev => ({ ...prev, loading: true }));
  //   try {
  //     const from = (page - 1) * PAGE_SIZE;
  //     const to = from + PAGE_SIZE - 1;
      
  //     const { data, count, error } = await supabase
  //       .from("feedback")
  //       .select("*", { count: "exact" })
  //       .order("created_at", { ascending: false })
  //       .range(from, to);
      
  //     if (error) throw error;
      
  //     setFeedbackData({
  //       data: data || [],
  //       total: count || 0,
  //       loading: false,
  //     });
  //     setFeedbackPage(page);
  //   } catch (error) {
  //     console.error("Error fetching feedback:", error);
  //     setFeedbackData(prev => ({ ...prev, loading: false }));
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch feedback data",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const exportToExcel = async (tableName, data, filename) => {
    if (!data || data.length === 0) {
      toast.info(`No records found in ${tableName} table`);
      return;
    }
    setExportingTable(tableName);
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
      const timestamp = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);
      await supabase.rpc("export_data_to_json", { table_name: tableName });
      toast.success(`${data.length} records exported`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export data");
    } finally {
      setExportingTable("");
    }
  };

  const fetchEvents = async (page) => {
    if (!isAdmin()) return;
    setEventsData(prev => ({ ...prev, loading: true }));
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, count, error } = await supabase
        .from("events")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      setEventsData({
        data: data || [],
        total: count || 0,
        loading: false,
      });
      setEventsPage(page);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEventsData(prev => ({ ...prev, loading: false }));
      toast.error("Failed to fetch events data");
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin()) return;

    try {
      // Find the monthIndex based on the selected month
      const selectedMonth = months.find(m => m.value === eventForm.month);
      const monthIndex = selectedMonth ? selectedMonth.index : 0;

      const eventData = {
        title: eventForm.title,
        date: eventForm.date,
        month: eventForm.month,
        month_index: monthIndex,
        year: parseInt(eventForm.year),
        description: eventForm.description,
        location: eventForm.location,
        time: eventForm.time,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from("events")
        .insert([eventData])
        .select();

      if (error) throw error;

      toast.success("Event created successfully!");
      
      // Reset form
      setEventForm({
        title: '',
        date: '',
        month: '',
        year: new Date().getFullYear(),
        description: '',
        location: '',
        time: ''
      });
      
      setShowEventForm(false);
      
      // Refresh events data and stats
      await fetchEvents(1);
      await fetchStats();
      
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add handlers for card clicks
  const handleCardClick = (sectionIndex) => {
    setActiveSection(sectionIndex);
    scrollToTop();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Floating background law-related icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 md:left-10 animate-float opacity-10">
          <Scale className="w-12 h-12 md:w-16 md:h-16 text-secondary" />
        </div>
        <div className="absolute top-40 right-4 md:right-20 animate-float-delayed opacity-10">
          <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-secondary" />
        </div>
        <div className="absolute bottom-60 left-4 md:left-20 animate-float opacity-10">
          <Users className="w-12 h-12 md:w-14 md:h-14 text-accent" />
        </div>
        <div className="absolute top-60 left-1/2 transform -translate-x-1/2 animate-float-delayed opacity-10">
          <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
        </div>
        <div className="absolute bottom-40 right-8 md:right-16 animate-float opacity-10">
          <Gavel className="w-10 h-10 md:w-12 md:h-12 text-accent" />
        </div>
        <div className="absolute top-80 left-1/4 animate-float-delayed opacity-10">
          <FileText className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
        </div>
        <div className="absolute bottom-80 right-1/3 animate-float opacity-10">
          <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-accent" />
        </div>
      </div>

      <Header />
      <div ref={topRef} />
      <div className="relative z-10 container mx-auto px-4 pt-6 pb-2">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 lg:mb-6">
          Welcome back, Admin!
        </h1>
      </div>
      <div className="relative z-10 container mx-auto px-4 pb-8 space-y-6 lg:space-y-8 flex-1">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          <div onClick={() => handleCardClick(0)} className="cursor-pointer">
            <Card className="hover:shadow-2xl transition-all bg-card/90 backdrop-blur-lg border border-border shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentees</CardTitle>
                <Users className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.mentees}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered applications
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div onClick={() => handleCardClick(1)} className="cursor-pointer">
            <Card className="hover:shadow-2xl transition-all bg-card/90 backdrop-blur-lg border border-border shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentors</CardTitle>
                <UserCheck className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.mentors}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered applications
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div onClick={() => handleCardClick(2)} className="cursor-pointer">
            <Card className="hover:shadow-2xl transition-all bg-card/90 backdrop-blur-lg border border-border shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Events</CardTitle>
                <Calendar className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.events}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Timeline events created
                </p>
              </CardContent>
            </Card>
          </div>

          <div onClick={() => handleCardClick(3)} className="cursor-pointer">
            <Card className="hover:shadow-2xl transition-all bg-card/90 backdrop-blur-lg border border-border shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Outlines</CardTitle>
                <FileText className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.outlines}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Uploaded outlines
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Link href="/exports">
            <Card className="cursor-pointer hover:shadow-2xl transition-all bg-card/90 backdrop-blur-lg border border-border shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Data Exports</CardTitle>
                <Activity className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.exports}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total exports performed
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Table Sections */}
        {activeSection === 0 && (
          <MenteesTable
            data={menteesData}
            currentPage={menteesPage}
            onPageChange={(page) => {
              fetchMentees(page);
              scrollToTop();
            }}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
            pageSize={PAGE_SIZE}
          />
        )}
        {activeSection === 1 && (
          <MentorsTable
            data={mentorsData}
            currentPage={mentorsPage}
            onPageChange={(page) => {
              fetchMentors(page);
              scrollToTop();
            }}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
            pageSize={PAGE_SIZE}
          />
        )}
        {activeSection === 2 && (
          <EventsTable
            data={eventsData}
            currentPage={eventsPage}
            onPageChange={async (page) => {
              await fetchEvents(page);
              scrollToTop();
            }}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
            pageSize={PAGE_SIZE}
            showEventForm={showEventForm}
            setShowEventForm={setShowEventForm}
            eventForm={eventForm}
            setEventForm={setEventForm}
            handleEventSubmit={handleEventSubmit}
            months={months}
          />
        )}
        {activeSection === 3 && (
          <OutlinesTable
            data={outlinesData}
            currentPage={outlinesPage}
            onPageChange={(page) => {
              fetchOutlines(page);
              scrollToTop();
            }}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
            pageSize={PAGE_SIZE}
          />
        )}
        {/* Feedback section commented out - not currently implemented
        {activeSection === 2 && (
          <FeedbackTable
            data={feedbackData}
            currentPage={feedbackPage}
            onPageChange={fetchFeedback}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
            pageSize={PAGE_SIZE}
          />
        )}
        */}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            className="w-full sm:w-auto flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="hidden sm:block text-muted-foreground text-sm font-medium">
            {activeSection === 0 && 'Mentees'} 
            {activeSection === 1 && 'Mentors'} 
            {activeSection === 2 && 'Events'}
            {activeSection === 3 && 'Outlines'}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleNext}
            className="w-full sm:w-auto flex items-center justify-center"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollToTop />
      <Footer />
    </div>
  );
};

// --- Outlines Table Component ---
const OutlinesTable = ({
  data,
  currentPage,
  onPageChange,
  exportToExcel,
  exportingTable,
  pageSize,
}) => {
  const totalPages = Math.ceil(data.total / pageSize);
  const [editOutlineId, setEditOutlineId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // 🔍 Server-side search
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!search) {
        setSearchResults(null);
        return;
      }

      setSearchLoading(true);
      const { data: results, error } = await supabase
        .from("outlines")
        .select("*")
        .or(
          `title.ilike.%${search}%,topic.ilike.%${search}%,professor.ilike.%${search}%`
        )
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch search results: " + error.message);
      } else {
        setSearchResults(results);
      }
      setSearchLoading(false);
    };

    const delayDebounce = setTimeout(fetchSearchResults, 400); // debounce
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // ✏️ Edit handler
  const handleEditClick = (outline) => {
    setEditOutlineId(outline.id);
    setEditForm({ ...outline });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("outlines")
        .update({
          title: editForm.title,
          topic: editForm.topic,
          year: editForm.year,
          professor: editForm.professor,
        })
        .eq("id", editOutlineId);

      if (error) throw error;
      toast.success("Outline updated!");
      setEditOutlineId(null);
      setEditForm(null);

      if (search) {
        // refresh search results
        setSearch(search + ""); // trigger useEffect
      } else {
        await onPageChange(currentPage);
      }
    } catch (error) {
      toast.error("Failed to update outline: " + error.message);
    }
  };

  // 🗑️ Delete handler
  const showDeleteConfirm = (outlineId) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-destructive">
            Are you sure you want to delete this outline?
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              className="transition-all duration-150 shadow hover:scale-105 focus:ring-2 focus:ring-destructive"
              onClick={async () => {
                closeToast();
                setDeletingId(outlineId);
                try {
                  const { error } = await supabase
                    .from("outlines")
                    .delete()
                    .eq("id", outlineId);
                  if (error) throw error;
                  toast.success("Outline deleted successfully!");
                  if (search) {
                    setSearch(search + ""); // refresh search results
                  } else {
                    await onPageChange(currentPage);
                  }
                } catch (error) {
                  toast.error("Failed to delete outline: " + error.message);
                } finally {
                  setDeletingId(null);
                }
              }}
            >
              Yes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="transition-all duration-150 hover:bg-muted/30"
              onClick={closeToast}
            >
              Cancel
            </Button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
        className: "bg-card border border-border shadow-lg",
      }
    );
  };

  // pick correct dataset (search results OR paginated data)
  const outlinesToRender = search ? searchResults : data.data;

  return (
    <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-foreground">Outlines</CardTitle>
            <CardDescription className="text-muted-foreground">
              All uploaded outlines ({data.total} total)
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Input
              type="text"
              placeholder="Search by title, topic, professor"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button
              onClick={() =>
                exportToExcel("outlines", outlinesToRender, "outlines_export")
              }
              disabled={exportingTable === "outlines"}
              className="w-full sm:w-auto"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {exportingTable === "outlines"
                  ? "Exporting..."
                  : "Export to Excel"}
              </span>
              <span className="sm:hidden">
                {exportingTable === "outlines" ? "Exporting..." : "Export"}
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Edit Form */}
        {editOutlineId && editForm && (
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Edit Outline</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-outline-title">Title *</Label>
                    <Input
                      id="edit-outline-title"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-outline-topic">Topic *</Label>
                    <Input
                      id="edit-outline-topic"
                      value={editForm.topic}
                      onChange={(e) =>
                        setEditForm({ ...editForm, topic: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-outline-year">Year *</Label>
                    <Input
                      id="edit-outline-year"
                      value={editForm.year}
                      onChange={(e) =>
                        setEditForm({ ...editForm, year: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-outline-professor">Professor *</Label>
                    <Input
                      id="edit-outline-professor"
                      value={editForm.professor}
                      onChange={(e) =>
                        setEditForm({ ...editForm, professor: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save Changes</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditOutlineId(null);
                      setEditForm(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="rounded-md border border-border w-max min-w-full bg-card/50 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/50 backdrop-blur-sm">
                  <TableHead className="min-w-[180px]">Title</TableHead>
                  <TableHead className="min-w-[120px]">Topic</TableHead>
                  <TableHead className="min-w-[120px]">Year</TableHead>
                  <TableHead className="min-w-[120px]">Professor</TableHead>
                  <TableHead className="min-w-[120px]">Created At</TableHead>
                  <TableHead className="min-w-[120px]">File</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.loading || searchLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      <span className="ml-2">Loading...</span>
                    </TableCell>
                  </TableRow>
                ) : outlinesToRender?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No outlines found
                    </TableCell>
                  </TableRow>
                ) : (
                  outlinesToRender?.map((outline) => (
                    <TableRow
                      key={outline.id}
                      className="border-border hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>{outline.title}</TableCell>
                      <TableCell>{outline.topic}</TableCell>
                      <TableCell>{outline.year}</TableCell>
                      <TableCell>{outline.professor}</TableCell>
                      <TableCell>
                        {outline.created_at
                          ? new Date(outline.created_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {outline.file_url ? (
                          <a
                            href={outline.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent underline"
                          >
                            Download
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mr-2"
                          onClick={() => handleEditClick(outline)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deletingId === outline.id}
                          onClick={() => showDeleteConfirm(outline.id)}
                        >
                          {deletingId === outline.id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination (disabled if searching) */}
        {totalPages > 1 && !search && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && onPageChange(currentPage - 1)
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => onPageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages &&
                      onPageChange(currentPage + 1)
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EventsTable = ({ 
  data, 
  currentPage, 
  onPageChange, 
  exportToExcel, 
  exportingTable, 
  pageSize,
  showEventForm,
  setShowEventForm,
  eventForm,
  setEventForm,
  handleEventSubmit,
  months
}) => {
  const [editEventId, setEditEventId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Edit handler
  const handleEditClick = (event) => {
    setEditEventId(event.id);
    setEditForm({ ...event });
    setShowEventForm(false);
  };

  // Update event in Supabase
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: editForm.title,
          date: editForm.date,
          month: editForm.month,
          month_index: months.find(m => m.value === editForm.month)?.index || 0,
          year: parseInt(editForm.year),
          description: editForm.description,
          location: editForm.location,
          time: editForm.time,
        })
        .eq("id", editEventId);

      if (error) throw error;
      toast.success("Event updated!");
      setEditEventId(null);
      setEditForm(null);
      await onPageChange(currentPage);
    } catch (error) {
      toast.error("Failed to update event: " + error.message);
    }
  };

  const showDeleteConfirm = (eventId) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-destructive">Are you sure you want to delete this event?</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              className="transition-all duration-150 shadow hover:scale-105 focus:ring-2 focus:ring-destructive"
              onClick={async () => {
                closeToast();
                setDeletingId(eventId);
                try {
                  const { error } = await supabase.from("events").delete().eq("id", eventId);
                  if (error) throw error;
                  toast.success("Event deleted successfully!");
                  await onPageChange(currentPage);
                } catch (error) {
                  toast.error("Failed to delete event: " + error.message);
                } finally {
                  setDeletingId(null);
                }
              }}
            >
              Yes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="transition-all duration-150 hover:bg-muted/30"
              onClick={closeToast}
            >
              Cancel
            </Button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
        className: "bg-card border border-border shadow-lg",
      }
    );
  };

  const totalPages = Math.ceil(data.total / pageSize);

  return (
    <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-foreground">Timeline Events</CardTitle>
            <CardDescription className="text-muted-foreground">
              All timeline events ({data.total} total)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowEventForm(!showEventForm)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
            <Button
              onClick={() => exportToExcel('events', data.data, 'events_export')}
              disabled={exportingTable === 'events'}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{exportingTable === 'events' ? 'Exporting...' : 'Export to Excel'}</span>
              <span className="sm:hidden">{exportingTable === 'events' ? 'Exporting...' : 'Export'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showEventForm && (
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      placeholder="e.g., Late October 2025, Dec 1, 2025"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="month">Month *</Label>
                    <Select 
                      value={eventForm.month} 
                      onValueChange={(value) => setEventForm({...eventForm, month: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={eventForm.year}
                      onChange={(e) => setEventForm({...eventForm, year: e.target.value})}
                      min="2025"
                      max="2030"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                      placeholder="e.g., On-campus, Self-paced"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                      placeholder="e.g., 9:00 AM, —"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    rows={3}
                    placeholder="Event description..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Event</Button>
                  <Button type="button" variant="outline" onClick={() => setShowEventForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Edit Form */}
        {editEventId && editForm && (
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Edit Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-date">Date *</Label>
                    <Input
                      id="edit-date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-month">Month *</Label>
                    <Select 
                      value={editForm.month} 
                      onValueChange={(value) => setEditForm({...editForm, month: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-year">Year *</Label>
                    <Input
                      id="edit-year"
                      type="number"
                      value={editForm.year}
                      onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                      min="2025"
                      max="2030"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-time">Time</Label>
                    <Input
                      id="edit-time"
                      value={editForm.time}
                      onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={() => { setEditEventId(null); setEditForm(null); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="overflow-x-auto">
          <div className="rounded-md border border-border w-max min-w-full bg-card/50 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/50 backdrop-blur-sm">
                  <TableHead className="text-foreground font-semibold min-w-[200px]">Title</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[120px]">Date</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[80px]">Month</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[80px]">Year</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[120px]">Location</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[80px]">Time</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[200px]">Description</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading events...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No events found. Create your first event above.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data?.map((event) => (
                    <TableRow key={event.id} className="border-border hover:bg-muted/20">
                      <TableCell className="font-medium text-foreground">{event.title}</TableCell>
                      <TableCell className="text-foreground">{event.date}</TableCell>
                      <TableCell className="text-foreground">{event.month}</TableCell>
                      <TableCell className="text-foreground">{event.year}</TableCell>
                      <TableCell className="text-foreground">{event.location || '—'}</TableCell>
                      <TableCell className="text-foreground">{event.time || '—'}</TableCell>
                      <TableCell className="text-foreground max-w-[200px] truncate">
                        {event.description || '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mr-2 transition-all duration-150 hover:bg-accent/20 hover:text-accent-foreground hover:border-accent"
                          onClick={() => handleEditClick(event)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deletingId === event.id}
                          className="transition-all duration-150 hover:bg-red-600 hover:text-white"
                          onClick={() => showDeleteConfirm(event.id)}
                        >
                          {deletingId === event.id ? "Deleting..." : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
};

const MenteesTable = ({ data, currentPage, onPageChange, exportToExcel, exportingTable, pageSize }) => {
  const totalPages = Math.ceil(data.total / pageSize);
  
  return (
    <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-foreground">Mentees</CardTitle>
            <CardDescription className="text-muted-foreground">
              All registered mentees ({data.total} total)
            </CardDescription>
          </div>
          <Button
            onClick={() => exportToExcel('profiles_mentees', data.data, 'mentees_export')}
            disabled={exportingTable === 'profiles_mentees'}
            className="w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{exportingTable === 'profiles_mentees' ? 'Exporting...' : 'Export to Excel'}</span>
            <span className="sm:hidden">{exportingTable === 'profiles_mentees' ? 'Exporting...' : 'Export'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="rounded-md border border-border w-max min-w-full bg-card/50 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/50 backdrop-blur-sm">
                  <TableHead className="text-foreground font-semibold min-w-[180px]">Email</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[100px]">Role</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[120px]">Created At</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[120px]">Updated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {data.loading ? (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                       <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                       <span className="ml-2">Loading...</span>
                     </TableCell>
                   </TableRow>
                 ) : data.data.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                       No mentees found
                     </TableCell>
                   </TableRow>
                 ) : (
                   data.data.map((mentee) => (
                     <TableRow key={mentee.id} className="border-border hover:bg-muted/50 transition-colors duration-200">
                       <TableCell className="text-foreground font-medium">
                         {mentee.email}
                       </TableCell>
                       <TableCell className="text-muted-foreground text-sm capitalize">{mentee.role}</TableCell>
                       <TableCell className="text-muted-foreground text-sm">
                         {new Date(mentee.created_at).toLocaleDateString()}
                       </TableCell>
                       <TableCell className="text-muted-foreground text-sm">
                         {new Date(mentee.updated_at).toLocaleDateString()}
                       </TableCell>
                     </TableRow>
                   ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MentorsTable = ({ data, currentPage, onPageChange, exportToExcel, exportingTable, pageSize }) => {
  const totalPages = Math.ceil(data.total / pageSize);
  
  return (
    <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-foreground">Mentors</CardTitle>
            <CardDescription className="text-muted-foreground">
              All registered mentors ({data.total} total)
            </CardDescription>
          </div>
          <Button
            onClick={() => exportToExcel('profiles_mentors', data.data, 'mentors_export')}
            disabled={exportingTable === 'profiles_mentors'}
            className="w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{exportingTable === 'profiles_mentors' ? 'Exporting...' : 'Export to Excel'}</span>
            <span className="sm:hidden">{exportingTable === 'profiles_mentors' ? 'Exporting...' : 'Export'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="rounded-md border border-border w-min min-w-full bg-card/50 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/50 backdrop-blur-sm">
                  <TableHead className="text-foreground font-semibold min-w-[180px]">Email</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[100px]">Role</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[120px]">Created At</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[120px]">Updated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {data.loading ? (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                       <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                       <span className="ml-2">Loading...</span>
                     </TableCell>
                   </TableRow>
                 ) : data.data.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                       No mentors found
                     </TableCell>
                   </TableRow>
                 ) : (
                   data.data.map((mentor) => (
                     <TableRow key={mentor.id} className="border-border hover:bg-muted/50 transition-colors duration-200">
                       <TableCell className="text-foreground font-medium">
                         {mentor.email}
                       </TableCell>
                       <TableCell className="text-muted-foreground text-sm capitalize">{mentor.role}</TableCell>
                       <TableCell className="text-muted-foreground text-sm">
                         {new Date(mentor.created_at).toLocaleDateString()}
                       </TableCell>
                       <TableCell className="text-muted-foreground text-sm">
                         {new Date(mentor.updated_at).toLocaleDateString()}
                       </TableCell>
                     </TableRow>
                   ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// const FeedbackTable = ({ data, currentPage, onPageChange, exportToExcel, exportingTable, pageSize }) => {
//   const totalPages = Math.ceil(data.total / pageSize);
  
//   return (
//     <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
//       <CardHeader>
//         <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
//           <div>
//             <CardTitle className="text-foreground">Feedback</CardTitle>
//             <CardDescription className="text-muted-foreground">
//               User feedback submissions ({data.total} total)
//             </CardDescription>
//           </div>
//           <Button
//             onClick={() => exportToExcel('feedback', data.data, 'feedback_export')}
//             disabled={exportingTable === 'feedback'}
//             className="w-full sm:w-auto"
//           >
//             <FileSpreadsheet className="h-4 w-4 mr-2" />
//             <span className="hidden sm:inline">{exportingTable === 'feedback' ? 'Exporting...' : 'Export to Excel'}</span>
//             <span className="sm:hidden">{exportingTable === 'feedback' ? 'Exporting...' : 'Export'}</span>
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="overflow-x-auto">
//           <div className="rounded-md border border-border w-max min-w-full bg-card/50 backdrop-blur-sm">
//             <Table>
//               <TableHeader>
//                 <TableRow className="border-border bg-muted/50 backdrop-blur-sm">
//                   <TableHead className="text-foreground font-semibold min-w-[180px]">Email</TableHead>
//                   <TableHead className="text-foreground font-semibold min-w-[80px]">Rating</TableHead>
//                   <TableHead className="text-foreground font-semibold min-w-[200px]">Suggestions</TableHead>
//                   <TableHead className="text-foreground font-semibold min-w-[100px]">Created At</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {data.loading ? (
//                    <TableRow>
//                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
//                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
//                        <span className="ml-2">Loading...</span>
//                      </TableCell>
//                    </TableRow>
//                  ) : data.data.length === 0 ? (
//                    <TableRow>
//                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
//                        No feedback found
//                      </TableCell>
//                    </TableRow>
//                  ) : (
//                    data.data.map((item) => (
//                      <TableRow key={item.id} className="border-border hover:bg-muted/50 transition-colors duration-200">
//                        <TableCell className="text-muted-foreground text-sm">{item.user_email}</TableCell>
//                        <TableCell className="text-muted-foreground text-sm">{item.rating}/5</TableCell>
//                        <TableCell className="text-muted-foreground text-sm whitespace-normal break-words max-w-[180px]">{item.suggestions}</TableCell>
//                        <TableCell className="text-muted-foreground text-sm">
//                          {new Date(item.created_at).toLocaleDateString()}
//                        </TableCell>
//                      </TableRow>
//                    ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
        
//         {/* Pagination Controls */}
//         {totalPages > 1 && (
//           <div className="flex justify-center mt-6">
//             <Pagination>
//               <PaginationContent>
//                 <PaginationItem>
//                   <PaginationPrevious 
//                     onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
//                     className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
//                   />
//                 </PaginationItem>
                
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                   <PaginationItem key={page}>
//                     <PaginationLink
//                       onClick={() => onPageChange(page)}
//                       isActive={currentPage === page}
//                       className="cursor-pointer"
//                     >
//                       {page}
//                     </PaginationLink>
//                   </PaginationItem>
//                 ))}
                
//                 <PaginationItem>
//                   <PaginationNext 
//                     onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
//                     className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
//                   />
//                 </PaginationItem>
//               </PaginationContent>
//             </Pagination>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };
