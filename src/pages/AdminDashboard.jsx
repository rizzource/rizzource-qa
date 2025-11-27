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
import { Checkbox } from "@/components/ui/checkbox";
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
  const { user, userProfile, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState({
    mentees: 0,
    mentors: 0,
    events: 0,
    exports: 0,
    outlines: 0,
    companies: 0,
  });

  // Pagination state for each table
  const [menteesData, setMenteesData] = useState({ data: [], total: 0, loading: false });
  const [mentorsData, setMentorsData] = useState({ data: [], total: 0, loading: false });
  const [outlinesData, setOutlinesData] = useState({ data: [], total: 0, loading: false });
  const [companiesData, setCompaniesData] = useState({ data: [], total: 0, loading: false }); 
  // const [feedbackData, setFeedbackData] = useState({ data: [], total: 0, loading: false });
  
  const [menteesPage, setMenteesPage] = useState(1);
  const [mentorsPage, setMentorsPage] = useState(1);
  const [outlinesPage, setOutlinesPage] = useState(1);
  const [companiesPage, setCompaniesPage] = useState(1);
  // const [feedbackPage, setFeedbackPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [exportingTable, setExportingTable] = useState("");
  const [activeSection, setActiveSection] = useState(0); // 0=mentees,1=mentors,2=events,3=outlines,4=companies
  const [eventsData, setEventsData] = useState({ data: [], total: 0, loading: false });
  const [eventsPage, setEventsPage] = useState(1);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const topRef = useRef(null);

  // AI CV prompt state (admin editable)
  const [aiCvPrompt, setAiCvPrompt] = useState("");
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);

  // New state for prompt management
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(false);

  // Dummy API: fetch current AI CV prompt (replace with real API later)
  const fetchAICVPrompt = async () => {
    if (!isSuperAdmin()) return;
    try {
      setLoadingPrompt(true);
      // simulate network delay
      await new Promise((res) => setTimeout(res, 300));
      // currently hardcoded prompt; replace with backend value later
      const existing = "Improve the candidate's CV focusing on clarity, achievements, and measurable results. Keep tone professional and concise. Prioritize technical skills, tools, and impact per role.";
      setAiCvPrompt(existing);
    } catch (err) {
      console.error("Failed to fetch AI CV prompt:", err);
      toast.error("Failed to load AI CV prompt");
    } finally {
      setLoadingPrompt(false);
    }
  };

  // Dummy API: save prompt to backend (replace with real API later)
  const saveAICVPrompt = async (prompt) => {
    if (!isSuperAdmin()) return;
    try {
      setSavingPrompt(true);
      // simulate network delay / API call
      await new Promise((res) => setTimeout(res, 500));
      // TODO: call backend endpoint to persist prompt
      // e.g. await supabase.functions.invoke('save-ai-prompt', { body: JSON.stringify({ prompt }) })
      return { ok: true };
    } catch (err) {
      console.error("Failed to save AI CV prompt:", err);
      throw err;
    } finally {
      setSavingPrompt(false);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Update handlePrev and handleNext to scroll to top
  const handlePrev = () => {
    setActiveSection((prev) => (prev > 0 ? prev - 1 : 5));
    scrollToTop();
  };

  const handleNext = () => {
    setActiveSection((prev) => (prev < 5 ? prev + 1 : 0));
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
    time: '',
    priority: false, 
  });

  const [companyForm, setCompanyForm] = useState({
    name: "",
    description: "",
    website: "",
    owner_name: "",
    owner_email: "",
    owner_password: "",
  });

  const months = [
    { value: 'January', index: 0 },
    { value: 'February', index: 1 },
    { value: 'March', index: 2 },
    { value: 'April', index: 3 },
    { value: 'May', index: 4 },
    { value: 'June', index: 5 },
    { value: 'July', index: 6 },
    { value: 'August', index: 7 },
    { value: 'September', index: 8 },
    { value: 'October', index: 9 },
    { value: 'November', index: 10 },
    { value: 'December', index: 11 }
  ];

  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (userProfile && !isSuperAdmin()) {
      navigate("/");
      return;
    }
    fetchStats();
    fetchAllData();
    fetchAICVPrompt();
  }, [user, userProfile, navigate, isSuperAdmin]);

  const fetchStats = async () => {
    if (!isSuperAdmin()) return;
    try {
      const [
        menteesResponse,
        mentorsResponse,
        exportsResponse,
        eventsResponse,
        outlinesResponse,
        companiesResponse
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "mentee"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "mentor"),
        supabase.from("data_exports").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("outlines").select("*", { count: "exact", head: true }),
        supabase.from("companies").select("*", { count: "exact", head: true })
      ]);
      
      setStats({
        mentees: menteesResponse.count || 0,
        mentors: mentorsResponse.count || 0,
        events: eventsResponse.count || 0,
        exports: exportsResponse.count || 0,
        outlines: outlinesResponse.count || 0,
        companies: companiesResponse.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch dashboard stats");
    }
  };

  // --- Add fetchOutlines function ---
  const fetchOutlines = async (page) => {
    if (!isSuperAdmin()) return;
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
    if (!isSuperAdmin()) return;
    setLoading(true); // Ensure loading is set to true at the start
    try {
      await Promise.all([
        fetchMentees(1),
        fetchMentors(1),
        fetchEvents(1),
        fetchOutlines(1),
        fetchCompanies(1),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!isSuperAdmin()) return;
    try {
      const { data, error } = await supabase.from("profiles").select("id, email").order("email");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMentees = async (page) => {
    if (!isSuperAdmin()) return;
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
    if (!isSuperAdmin()) return;
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
  //   if (!isSuperAdmin()) return;
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
    if (!isSuperAdmin()) return;
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

  const fetchCompanies = async (page) => {
    if (!isSuperAdmin()) return;
    setCompaniesData((prev) => ({ ...prev, loading: true }));
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await supabase
        .from("companies")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setCompaniesData({
        data: data || [],
        total: count || 0,
        loading: false,
      });
      setCompaniesPage(page);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompaniesData((prev) => ({ ...prev, loading: false }));
      toast.error("Failed to fetch companies data");
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin()) return;

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
        priority: eventForm.priority,
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

  const handleCompanySubmit = async (e) => {
    e.preventDefault();

    if (!isSuperAdmin()) {
      return;
    }

    try {
      if (!companyForm.name || !companyForm.owner_name || !companyForm.owner_email || !companyForm.owner_password) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Ensure we include auth token header when invoking the edge function
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        toast.error("Failed to get authentication session.");
        return;
      }

      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        toast.error("You must be logged in to perform this action.");
        return;
      }

      // Prepare body for edge function
      const requestBody = {
        name: companyForm.name,
        description: companyForm.description || null,
        website: companyForm.website || null,
        owner_name: companyForm.owner_name,
        owner_email: companyForm.owner_email,
        owner_password: companyForm.owner_password,
      };


      // Call edge function to create company with owner account
      const { data, error } = await supabase.functions.invoke("create-company-with-owner", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success("Company and owner account created successfully!");

      // Reset form
      setCompanyForm({
        name: "",
        description: "",
        website: "",
        owner_name: "",
        owner_email: "",
        owner_password: "",
      });

      setShowCompanyForm(false);

      // Refresh companies data and stats
      await fetchCompanies(1);
      await fetchStats();
    } catch (error) {
      toast.error("Failed to create company: " + error.message);
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

  if (!user || !isSuperAdmin()) {
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

          <div onClick={() => handleCardClick(4)} className="cursor-pointer">
            <Card className="hover:shadow-2xl transition-all bg-card/90 backdrop-blur-lg border border-border shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Companies</CardTitle>
                <FileText className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.companies}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Companies Created
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div onClick={() => handleCardClick(5)} className="cursor-pointer">
            <Card className="hover:shadow-2xl transition-all bg-card/90 backdrop-blur-lg border border-border shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">AI CV Prompt</CardTitle>
                <MessageSquare className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">1</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active AI prompt
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
        {activeSection === 4 && (
          <CompaniesTable
            data={companiesData}
            currentPage={companiesPage}
            onPageChange={fetchCompanies}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
            pageSize={PAGE_SIZE}
            showCompanyForm={showCompanyForm}
            setShowCompanyForm={setShowCompanyForm}
            companyForm={companyForm}
            setCompanyForm={setCompanyForm}
            handleCompanySubmit={handleCompanySubmit}
            users={users}
          />
        )}
        {activeSection === 5 && (
          <PromptManagementTable
            aiCvPrompt={aiCvPrompt}
            setAiCvPrompt={setAiCvPrompt}
            loadingPrompt={loadingPrompt}
            savingPrompt={savingPrompt}
            saveAICVPrompt={saveAICVPrompt}
            showPromptForm={showPromptForm}
            setShowPromptForm={setShowPromptForm}
            editingPrompt={editingPrompt}
            setEditingPrompt={setEditingPrompt}
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
            {activeSection === 4 && 'Companies'}
            {activeSection === 5 && 'AI CV Prompt'}
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
  const [editOutlineId, setEditOutlineId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // 🔍 Search state
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // 📄 Pagination state for search
  const [searchPage, setSearchPage] = useState(1);
  const searchPageSize = 10;

  // 🔍 Server-side search with pagination
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!search) {
        setSearchResults(null);
        setSearchPage(1);
        return;
      }

      setSearchLoading(true);

      const from = (searchPage - 1) * searchPageSize;
      const to = from + searchPageSize - 1;

      const { data: results, error, count } = await supabase
        .from("outlines")
        .select("*", { count: "exact" })
        .or(
          `title.ilike.%${search}%,topic.ilike.%${search}%,professor.ilike.%${search}%`
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        toast.error("Failed to fetch search results: " + error.message);
      } else {
        setSearchResults({ rows: results, total: count });
      }
      setSearchLoading(false);
    };

    const delayDebounce = setTimeout(fetchSearchResults, 400); // debounce
    return () => clearTimeout(delayDebounce);
  }, [search, searchPage]);

  // ✏️ Edit handler
  const handleEditClick = (outline) => {
    setEditOutlineId(outline.id);
    setEditForm({ ...outline });
  };

  // ✅ Update outline in Supabase
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: updateResult, error } = await supabase
        .from("outlines")
        .update({
          title: editForm.title,
          topic: editForm.topic,
          year: editForm.year,
          professor: editForm.professor,
        })
        .eq("id", editOutlineId)
        .select();

      if (error) throw error;
      toast.success("Outline updated!");

      // reset edit state
      setEditOutlineId(null);
      setEditForm(null);

      // refresh data
      if (search) {
        setSearch(search + ""); // re-trigger search useEffect
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
          <span className="font-semibold text-destructive">Are you sure you want to delete this outline?</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              className="transition-all duration-150 shadow hover:scale-105 focus:ring-2 focus:ring-destructive"
              onClick={async () => {
                closeToast();
                setDeletingId(outlineId);
                try {
                  const { error } = await supabase.from("events").delete().eq("id", outlineId);
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

  // 📌 Decide which dataset to render
  const outlinesToRender = search ? searchResults?.rows : data.data;
  const totalOutlines = search ? searchResults?.total : data.total;
  const totalPages = Math.ceil(totalOutlines / pageSize);

  return (
    <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-foreground">Outlines</CardTitle>
            <CardDescription className="text-muted-foreground">
              All uploaded outlines ({totalOutlines} total)
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Input
              type="text"
              placeholder="Search by title, topic, professor"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchPage(1); // reset to first page on new search
              }}
              className="w-full sm:w-64"
            />
            <Button
              onClick={() =>
                exportToExcel("outlines", outlinesToRender, "outlines_export")
              }
              disabled={exportingTable === "outlines"}
              className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exportingTable === "outlines"
                ? "Exporting..."
                : "Export to Excel"}
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
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableRow key={outline.id}>
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
                          className="transition-all duration-150 hover:bg-red-600 hover:text-white"
                          onClick={() => showDeleteConfirm(outline.id)}
                        >
                          {deletingId === outline.id ? "Deleting..." : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      (search
                        ? searchPage > 1 && setSearchPage(searchPage - 1)
                        : currentPage > 1 && onPageChange(currentPage - 1))
                    }
                    className={
                      (search ? searchPage : currentPage) === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() =>
                          search ? setSearchPage(page) : onPageChange(page)
                        }
                        isActive={
                          (search ? searchPage : currentPage) === page
                        }
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
                      (search
                        ? searchPage < totalPages &&
                          setSearchPage(searchPage + 1)
                        : currentPage < totalPages &&
                          onPageChange(currentPage + 1))
                    }
                    className={
                      (search ? searchPage : currentPage) === totalPages
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
          priority: editForm.priority || false,
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
              className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
            <Button
              onClick={() => exportToExcel('events', data.data, 'events_export')}
              disabled={exportingTable === 'events'}
              variant="outline"
              className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
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
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      id="priority"
                      checked={!!eventForm.priority}
                      onCheckedChange={(checked) =>
                        setEventForm((prev) => ({ ...prev, priority: checked }))
                      }
                    />
                    <Label htmlFor="priority">Mark as Priority</Label>
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
                  <Button type="submit" className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300">Create Event</Button>
                  <Button type="button" variant="outline" onClick={() => setShowEventForm(false)} className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300">
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
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      id="edit-priority"
                      checked={!!editForm.priority}
                      onCheckedChange={(checked) =>
                        setEditForm((prev) => ({ ...prev, priority: checked }))
                      }
                    />
                    <Label htmlFor="edit-priority">Mark as Priority</Label>
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
                  <TableHead className="text-foreground font-semibold min-w-[100px] text-center">Priority</TableHead>
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
                      <TableCell className="text-center">
                        {event.priority ? (
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-800 rounded-full">
                            No
                          </span>
                        )}
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
            className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
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
            className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
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

const CompaniesTable = ({
  data,
  currentPage,
  onPageChange,
  exportToExcel,
  exportingTable,
  pageSize,
  showCompanyForm,
  setShowCompanyForm,
  companyForm,
  setCompanyForm,
  handleCompanySubmit,
  users,
}) => {
  const totalPages = Math.ceil(data.total / pageSize);

  // --- Edit/Delete State ---
  const [editCompanyId, setEditCompanyId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // --- Edit Handler ---
  const handleEditClick = (company) => {
    setEditCompanyId(company.id);
    setEditForm({ ...company });
    setShowCompanyForm(false);
  };

  // --- Update Company in Supabase ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("companies")
        .update({
          name: editForm.name,
          description: editForm.description,
          website: editForm.website,
          owner_email: editForm.owner_email,
        })
        .eq("id", editCompanyId);

      if (error) throw error;
      toast.success("Company updated!");
      setEditCompanyId(null);
      setEditForm(null);
      await onPageChange(currentPage);
    } catch (error) {
      toast.error("Failed to update company: " + error.message);
    }
  };

  // --- Delete Handler ---
  const showDeleteConfirm = (companyId) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-destructive">Are you sure you want to delete this company?</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              className="transition-all duration-150 shadow hover:scale-105 focus:ring-2 focus:ring-destructive"
              onClick={async () => {
                closeToast();
                setDeletingId(companyId);
                try {
                  const { error } = await supabase.from("companies").delete().eq("id", companyId);
                  if (error) throw error;
                  toast.success("Company deleted successfully!");
                  await onPageChange(currentPage);
                } catch (error) {
                  toast.error("Failed to delete company: " + error.message);
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

  return (
    <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-foreground">Companies</CardTitle>
            <CardDescription className="text-muted-foreground">
              All registered companies ({data.total} total)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCompanyForm(!showCompanyForm)} className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Create Company
            </Button>
            <Button
              onClick={() => exportToExcel("companies", data.data, "companies_export")}
              disabled={exportingTable === "companies"}
              variant="outline"
              className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {exportingTable === "companies" ? "Exporting..." : "Export to Excel"}
              </span>
              <span className="sm:hidden">{exportingTable === "companies" ? "Exporting..." : "Export"}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* --- Edit Form --- */}
        {editCompanyId && editForm && (
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Edit Company</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-company-name">Company Name *</Label>
                    <Input
                      id="edit-company-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-company-website">Website</Label>
                    <Input
                      id="edit-company-website"
                      type="url"
                      value={editForm.website || ""}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-company-owner-email">Owner Email</Label>
                    <Input
                      id="edit-company-owner-email"
                      type="email"
                      value={editForm.owner_email || ""}
                      onChange={(e) => setEditForm({ ...editForm, owner_email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-company-description">Description</Label>
                  <Textarea
                    id="edit-company-description"
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save Changes</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditCompanyId(null);
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

        {/* --- Create Form --- */}
        {showCompanyForm && !editCompanyId && (
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Create New Company</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      placeholder="Acme Corporation"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner_name">Owner Name *</Label>
                    <Input
                      id="owner_name"
                      value={companyForm.owner_name}
                      onChange={(e) => setCompanyForm({ ...companyForm, owner_name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner_email">Owner Email *</Label>
                    <Input
                      id="owner_email"
                      type="email"
                      value={companyForm.owner_email}
                      onChange={(e) => setCompanyForm({ ...companyForm, owner_email: e.target.value })}
                      placeholder="owner@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner_password">Owner Password *</Label>
                    <Input
                      id="owner_password"
                      type="password"
                      value={companyForm.owner_password}
                      onChange={(e) => setCompanyForm({ ...companyForm, owner_password: e.target.value })}
                      placeholder="Password for owner account"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                    rows={3}
                    placeholder="About the company..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300">Create Company</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCompanyForm(false)} className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300">
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
                  <TableHead className="text-foreground font-semibold min-w-[200px]">Company Name</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[180px]">Owner Email</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[200px]">Website</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[250px]">Description</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[120px]">Created</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading companies...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No companies found. Create your first company above.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data?.map((company) => (
                    <TableRow key={company.id} className="border-border hover:bg-muted/20">
                      <TableCell className="font-medium text-foreground">{company.name}</TableCell>
                      <TableCell className="text-foreground">{company.owner_email || "N/A"}</TableCell>
                      <TableCell className="text-foreground">
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {company.website}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-foreground max-w-[250px] truncate">
                        {company.description || "—"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {company.created_at ? new Date(company.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mr-2"
                          onClick={() => handleEditClick(company)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deletingId === company.id}
                          className="transition-all duration-150 hover:bg-red-600 hover:text-white"
                          onClick={() => showDeleteConfirm(company.id)}
                        >
                          {deletingId === company.id ? "Deleting..." : "Delete"}
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

// --- Prompt Management Table Component ---
const PromptManagementTable = ({
  aiCvPrompt,
  setAiCvPrompt,
  loadingPrompt,
  savingPrompt,
  saveAICVPrompt,
  showPromptForm,
  setShowPromptForm,
  editingPrompt,
  setEditingPrompt,
}) => {
  const [tempPrompt, setTempPrompt] = useState(aiCvPrompt);

  useEffect(() => {
    setTempPrompt(aiCvPrompt);
  }, [aiCvPrompt]);

  const handleSavePrompt = async (e) => {
    e.preventDefault();
    
    if (!tempPrompt.trim()) {
      toast.error("Prompt cannot be empty");
      return;
    }

    try {
      const result = await saveAICVPrompt(tempPrompt);
      if (result.ok) {
        setAiCvPrompt(tempPrompt);
        setEditingPrompt(false);
        setShowPromptForm(false);
        toast.success("AI CV Prompt updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to save prompt: " + error.message);
    }
  };

  const handleCancel = () => {
    setTempPrompt(aiCvPrompt);
    setEditingPrompt(false);
    setShowPromptForm(false);
  };

  return (
    <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-foreground">AI CV Prompt Configuration</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage the prompt used by AI to improve candidate CVs
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setShowPromptForm(!showPromptForm);
              setEditingPrompt(!editingPrompt);
              setTempPrompt(aiCvPrompt);
            }}
            disabled={loadingPrompt}
            className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
          >
            {loadingPrompt ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : editingPrompt ? (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel Edit
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Edit Prompt
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Current Prompt Display */}
        {!editingPrompt && (
          <Card className="border border-border bg-muted/30 p-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-lg">Current Prompt:</h3>
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {loadingPrompt ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading prompt...
                    </div>
                  ) : aiCvPrompt ? (
                    aiCvPrompt
                  ) : (
                    <span className="text-muted-foreground italic">No prompt configured yet</span>
                  )}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                This prompt is sent to the AI model when processing CV improvement requests.
              </p>
            </div>
          </Card>
        )}

        {/* Edit Form */}
        {editingPrompt && (
          <Card className="border border-border bg-muted/20 p-6">
            <form onSubmit={handleSavePrompt} className="space-y-4">
              <div>
                <Label htmlFor="ai-prompt" className="text-lg font-semibold text-foreground mb-2 block">
                  Edit AI CV Prompt *
                </Label>
                <Textarea
                  id="ai-prompt"
                  value={tempPrompt}
                  onChange={(e) => setTempPrompt(e.target.value)}
                  rows={8}
                  placeholder="Enter the prompt for AI CV improvement..."
                  className="w-full font-mono text-sm resize-none"
                  required
                />
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <p className="text-sm text-foreground mb-2 font-semibold">Tips for effective prompts:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Be specific about CV improvement goals</li>
                  <li>Include tone and style preferences</li>
                  <li>Mention key elements to prioritize (skills, achievements, impact)</li>
                  <li>Specify the desired output format or length considerations</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={savingPrompt || !tempPrompt.trim()}
                  className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
                >
                  {savingPrompt ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Save Prompt
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={savingPrompt}
                  className="md:w-46 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Changes will be applied to all new CV improvement requests.
              </p>
            </form>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
// --- Feedback Table Component ---
/*
const FeedbackTable = ({ data, currentPage, onPageChange, exportToExcel, exportingTable, pageSize }) => {
  const totalPages = Math.ceil(data.total / pageSize);
  
  return (
    <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-foreground">Feedback</CardTitle>
            <CardDescription className="text-muted-foreground">
              User feedback submissions ({data.total} total)
            </CardDescription>
          </div>
          <Button
            onClick={() => exportToExcel('feedback', data.data, 'feedback_export')}
            disabled={exportingTable === 'feedback'}
            className="w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{exportingTable === 'feedback' ? 'Exporting...' : 'Export to Excel'}</span>
            <span className="sm:hidden">{exportingTable === 'feedback' ? 'Exporting...' : 'Export'}</span>
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
                  <TableHead className="text-foreground font-semibold min-w-[80px]">Rating</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[200px]">Suggestions</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[100px]">Created At</TableHead>
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
                       No feedback found
                     </TableCell>
                   </TableRow>
                 ) : (
                   data.data.map((item) => (
                     <TableRow key={item.id} className="border-border hover:bg-muted/50 transition-colors duration-200">
                       <TableCell className="text-muted-foreground text-sm">{item.user_email}</TableCell>
                       <TableCell className="text-muted-foreground text-sm">{item.rating}/5</TableCell>
                       <TableCell className="text-muted-foreground text-sm whitespace-normal break-words max-w-[180px]">{item.suggestions}</TableCell>
                       <TableCell className="text-muted-foreground text-sm">
                         {new Date(item.created_at).toLocaleDateString()}
                       </TableCell>
                     </TableRow>
                   ))
                 )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Pagination Controls *}
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
}; */
