import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const AdminDashboard = () => {
  const { user, userProfile, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState({
    mentees: 0,
    mentors: 0,
    events: 0,
    companies: 0,
    exports: 0,
  });

  // Pagination state for each table
  const [menteesData, setMenteesData] = useState({ data: [], total: 0, loading: false });
  const [mentorsData, setMentorsData] = useState({ data: [], total: 0, loading: false });
  const [companiesData, setCompaniesData] = useState({ data: [], total: 0, loading: false });
  // const [feedbackData, setFeedbackData] = useState({ data: [], total: 0, loading: false });

  const [menteesPage, setMenteesPage] = useState(1);
  const [mentorsPage, setMentorsPage] = useState(1);
  const [companiesPage, setCompaniesPage] = useState(1);
  // const [feedbackPage, setFeedbackPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [exportingTable, setExportingTable] = useState("");
  const [activeSection, setActiveSection] = useState(0); // 0=mentees,1=mentors,2=events,3=companies
  const [eventsData, setEventsData] = useState({ data: [], total: 0, loading: false });
  const [eventsPage, setEventsPage] = useState(1);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    month: "",
    year: new Date().getFullYear(),
    description: "",
    location: "",
    time: "",
  });

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    name: "",
    description: "",
    website: "",
    owner_name: "",
    owner_email: "",
    owner_password: "",
  });

  const months = [
    { value: "Jan", index: 0 },
    { value: "Feb", index: 1 },
    { value: "Mar", index: 2 },
    { value: "Apr", index: 3 },
    { value: "May", index: 4 },
    { value: "Jun", index: 5 },
    { value: "Jul", index: 6 },
    { value: "Aug", index: 7 },
    { value: "Sep", index: 8 },
    { value: "Oct", index: 9 },
    { value: "Nov", index: 10 },
    { value: "Dec", index: 11 },
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
  }, [user, userProfile, navigate, isSuperAdmin]);

  const fetchStats = async () => {
    if (!isSuperAdmin()) return;
    try {
      const [menteesResponse, mentorsResponse, exportsResponse, eventsResponse, companiesResponse] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "mentee"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "mentor"),
        supabase.from("data_exports").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("companies").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        mentees: menteesResponse.count || 0,
        mentors: mentorsResponse.count || 0,
        events: eventsResponse.count || 0,
        companies: companiesResponse.count || 0,
        exports: exportsResponse.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch dashboard stats");
    }
  };

  const fetchAllData = async () => {
    if (!isSuperAdmin()) return;
    try {
      await Promise.all([fetchMentees(1), fetchMentors(1), fetchEvents(1), fetchCompanies(1), fetchUsers()]);
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
    setMenteesData((prev) => ({ ...prev, loading: true }));
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
      setMenteesData((prev) => ({ ...prev, loading: false }));
      toast.error("Failed to fetch mentees data");
    }
  };

  const fetchMentors = async (page) => {
    if (!isSuperAdmin()) return;
    setMentorsData((prev) => ({ ...prev, loading: true }));
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
      setMentorsData((prev) => ({ ...prev, loading: false }));
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
    if (!isSuperAdmin()) return;
    setEventsData((prev) => ({ ...prev, loading: true }));
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
      setEventsData((prev) => ({ ...prev, loading: false }));
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
      const selectedMonth = months.find((m) => m.value === eventForm.month);
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
        created_by: user.id,
      };

      const { data, error } = await supabase.from("events").insert([eventData]).select();

      if (error) throw error;

      toast.success("Event created successfully!");

      // Reset form
      setEventForm({
        title: "",
        date: "",
        month: "",
        year: new Date().getFullYear(),
        description: "",
        location: "",
        time: "",
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
    if (!isSuperAdmin()) return;

    try {
      // Validate required fields
      if (!companyForm.name || !companyForm.owner_name || !companyForm.owner_email) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Insert company record using direct .insert()
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: companyForm.name,
          description: companyForm.description || null,
          website: companyForm.website || null,
          owner_name: companyForm.owner_name,
          owner_email: companyForm.owner_email,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      toast.success("Company created successfully! Note: Owner must register separately to create their account.");

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
      console.error("Error creating company:", error);
      toast.error("Failed to create company: " + error.message);
    }
  };

  const handlePrev = () => setActiveSection((prev) => (prev > 0 ? prev - 1 : 3));

  const handleNext = () => setActiveSection((prev) => (prev < 3 ? prev + 1 : 0));

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
            <CardDescription>You don't have permission to access the admin dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full bg-primary hover:bg-primary/90">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      <div className="relative z-10 container mx-auto px-4 pt-6 pb-2">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 lg:mb-6">Welcome back, Admin!</h1>
      </div>
      <div className="relative z-10 container mx-auto px-4 pb-8 space-y-6 lg:space-y-8 flex-1">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentees</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.mentees}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered applications</p>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentors</CardTitle>
              <UserCheck className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.mentors}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered applications</p>
            </CardContent>
          </Card>

          {/* <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.feedback}</div>
              <p className="text-xs text-muted-foreground mt-1">
                User submissions
              </p>
            </CardContent>
          </Card> */}

          <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Events</CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.events}</div>
              <p className="text-xs text-muted-foreground mt-1">Timeline events created</p>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.companies}</div>
              <p className="text-xs text-muted-foreground mt-1">Total companies created</p>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-lg border border-border shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Exports</CardTitle>
              <Activity className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.exports}</div>
              <p className="text-xs text-muted-foreground mt-1">Total exports performed</p>
            </CardContent>
          </Card>
        </div>

        {/* Table Sections */}
        {activeSection === 0 && (
          <MenteesTable
            data={menteesData}
            currentPage={menteesPage}
            onPageChange={fetchMentees}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
            pageSize={PAGE_SIZE}
          />
        )}
        {activeSection === 1 && (
          <MentorsTable
            data={mentorsData}
            currentPage={mentorsPage}
            onPageChange={fetchMentors}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
            pageSize={PAGE_SIZE}
          />
        )}
        {activeSection === 2 && (
          <EventsTable
            data={eventsData}
            currentPage={eventsPage}
            onPageChange={fetchEvents}
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
            {activeSection === 0 && "Mentees"}
            {activeSection === 1 && "Mentors"}
            {activeSection === 2 && "Events"}
            {activeSection === 3 && "Companies"}
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
      <Footer />
    </div>
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
  months,
}) => {
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
            <Button onClick={() => setShowEventForm(!showEventForm)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
            <Button
              onClick={() => exportToExcel("events", data.data, "events_export")}
              disabled={exportingTable === "events"}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {exportingTable === "events" ? "Exporting..." : "Export to Excel"}
              </span>
              <span className="sm:hidden">{exportingTable === "events" ? "Exporting..." : "Export"}</span>
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
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      placeholder="e.g., Late October 2025, Dec 1, 2025"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="month">Month *</Label>
                    <Select
                      value={eventForm.month}
                      onValueChange={(value) => setEventForm({ ...eventForm, month: value })}
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
                      onChange={(e) => setEventForm({ ...eventForm, year: e.target.value })}
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
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="e.g., On-campus, Self-paced"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      placeholder="e.g., 9:00 AM, —"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
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
                      <TableCell className="text-foreground">{event.location || "—"}</TableCell>
                      <TableCell className="text-foreground">{event.time || "—"}</TableCell>
                      <TableCell className="text-foreground max-w-[200px] truncate">
                        {event.description || "—"}
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
            onClick={() => exportToExcel("profiles_mentees", data.data, "mentees_export")}
            disabled={exportingTable === "profiles_mentees"}
            className="w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {exportingTable === "profiles_mentees" ? "Exporting..." : "Export to Excel"}
            </span>
            <span className="sm:hidden">{exportingTable === "profiles_mentees" ? "Exporting..." : "Export"}</span>
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
                    <TableRow
                      key={mentee.id}
                      className="border-border hover:bg-muted/50 transition-colors duration-200"
                    >
                      <TableCell className="text-foreground font-medium">{mentee.email || "No email"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm capitalize">
                        {mentee.role || "No role"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {mentee.created_at ? new Date(mentee.created_at).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {mentee.updated_at ? new Date(mentee.updated_at).toLocaleDateString() : "N/A"}
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
            onClick={() => exportToExcel("profiles_mentors", data.data, "mentors_export")}
            disabled={exportingTable === "profiles_mentors"}
            className="w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {exportingTable === "profiles_mentors" ? "Exporting..." : "Export to Excel"}
            </span>
            <span className="sm:hidden">{exportingTable === "profiles_mentors" ? "Exporting..." : "Export"}</span>
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
                    <TableRow
                      key={mentor.id}
                      className="border-border hover:bg-muted/50 transition-colors duration-200"
                    >
                      <TableCell className="text-foreground font-medium">{mentor.email || "No email"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm capitalize">
                        {mentor.role || "No role"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {mentor.created_at ? new Date(mentor.created_at).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {mentor.updated_at ? new Date(mentor.updated_at).toLocaleDateString() : "N/A"}
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
            <Button onClick={() => setShowCompanyForm(!showCompanyForm)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Company
            </Button>
            <Button
              onClick={() => exportToExcel("companies", data.data, "companies_export")}
              disabled={exportingTable === "companies"}
              variant="outline"
              className="w-full sm:w-auto"
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
        {showCompanyForm && (
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
                  <Button type="submit">Create Company</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCompanyForm(false)}>
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
                  <TableHead className="text-foreground font-semibold min-w-[180px]">Owner</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[200px]">Website</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[250px]">Description</TableHead>
                  <TableHead className="text-foreground font-semibold min-w-[120px]">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading companies...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
