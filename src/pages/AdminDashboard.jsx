import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const AdminDashboard = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    mentees: 0,
    mentors: 0,
    feedback: 0,
    exports: 0,
  });
  
  // Pagination state for each table
  const [menteesData, setMenteesData] = useState({ data: [], total: 0, loading: false });
  const [mentorsData, setMentorsData] = useState({ data: [], total: 0, loading: false });
  const [feedbackData, setFeedbackData] = useState({ data: [], total: 0, loading: false });
  
  const [menteesPage, setMenteesPage] = useState(1);
  const [mentorsPage, setMentorsPage] = useState(1);
  const [feedbackPage, setFeedbackPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [exportingTable, setExportingTable] = useState("");
  const [activeSection, setActiveSection] = useState(0); // 0=mentees,1=mentors,2=feedback
  const navigate = useNavigate();
  const { toast } = useToast();

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
        feedbackResponse,
        exportsResponse,
      ] = await Promise.all([
        supabase.from("mentees").select("*", { count: "exact", head: true }),
        supabase.from("mentors").select("*", { count: "exact", head: true }),
        supabase.from("feedback").select("*", { count: "exact", head: true }),
        supabase.from("data_exports").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        mentees: menteesResponse.count || 0,
        mentors: mentorsResponse.count || 0,
        feedback: feedbackResponse.count || 0,
        exports: exportsResponse.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard stats",
        variant: "destructive",
      });
    }
  };

  const fetchAllData = async () => {
    if (!isAdmin()) return;
    try {
      await Promise.all([
        fetchMentees(1),
        fetchMentors(1),
        fetchFeedback(1),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
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
        .from("mentees")
        .select("*", { count: "exact" })
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
      toast({
        title: "Error",
        description: "Failed to fetch mentees data",
        variant: "destructive",
      });
    }
  };

  const fetchMentors = async (page) => {
    if (!isAdmin()) return;
    setMentorsData(prev => ({ ...prev, loading: true }));
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, count, error } = await supabase
        .from("mentors")
        .select("*", { count: "exact" })
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
      toast({
        title: "Error",
        description: "Failed to fetch mentors data",
        variant: "destructive",
      });
    }
  };

  const fetchFeedback = async (page) => {
    if (!isAdmin()) return;
    setFeedbackData(prev => ({ ...prev, loading: true }));
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, count, error } = await supabase
        .from("feedback")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      setFeedbackData({
        data: data || [],
        total: count || 0,
        loading: false,
      });
      setFeedbackPage(page);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setFeedbackData(prev => ({ ...prev, loading: false }));
      toast({
        title: "Error",
        description: "Failed to fetch feedback data",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = async (tableName, data, filename) => {
    if (!data || data.length === 0) {
      toast({
        title: "No Data",
        description: `No records found in ${tableName} table`,
      });
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
      toast({
        title: "Export Successful",
        description: `${data.length} records exported`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExportingTable("");
    }
  };

  const handlePrev = () =>
    setActiveSection((prev) => (prev > 0 ? prev - 1 : 2));
  const handleNext = () =>
    setActiveSection((prev) => (prev < 2 ? prev + 1 : 0));

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-white/80">Loading dashboard...</p>
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

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col relative overflow-hidden">
      {/* Floating background law-related icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 md:left-10 animate-float opacity-10">
          <Scale className="w-12 h-12 md:w-16 md:h-16 text-gold-light" />
        </div>
        <div className="absolute top-40 right-4 md:right-20 animate-float-delayed opacity-10">
          <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </div>
        <div className="absolute bottom-60 left-4 md:left-20 animate-float opacity-10">
          <Users className="w-12 h-12 md:w-14 md:h-14 text-gold-light" />
        </div>
        <div className="absolute top-60 left-1/2 transform -translate-x-1/2 animate-float-delayed opacity-10">
          <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>
        <div className="absolute bottom-40 right-8 md:right-16 animate-float opacity-10">
          <Gavel className="w-10 h-10 md:w-12 md:h-12 text-gold-light" />
        </div>
        <div className="absolute top-80 left-1/4 animate-float-delayed opacity-10">
          <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>
        <div className="absolute bottom-80 right-1/3 animate-float opacity-10">
          <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-gold-light" />
        </div>
      </div>

      <Header />
      <div className="relative z-10 container mx-auto px-4 pt-6 pb-2">
        <h1 className="text-xl sm:text-2xl font-semibold text-white mb-4 lg:mb-6">
          Welcome back, Admin!
        </h1>
      </div>
      <div className="relative z-10 container mx-auto px-4 pb-8 space-y-6 lg:space-y-8 flex-1">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Mentees</CardTitle>
              <Users className="h-4 w-4 text-gold-light" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.mentees}</div>
              <p className="text-xs text-white/60 mt-1">
                Registered applications
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Mentors</CardTitle>
              <UserCheck className="h-4 w-4 text-gold-light" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.mentors}</div>
              <p className="text-xs text-white/60 mt-1">
                Registered applications
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-gold-light" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.feedback}</div>
              <p className="text-xs text-white/60 mt-1">
                User submissions
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Data Exports</CardTitle>
              <Activity className="h-4 w-4 text-gold-light" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.exports}</div>
              <p className="text-xs text-white/60 mt-1">
                Total exports performed
              </p>
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
          <FeedbackTable
            data={feedbackData}
            currentPage={feedbackPage}
            onPageChange={fetchFeedback}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
            pageSize={PAGE_SIZE}
          />
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            className="w-full sm:w-auto border-white/20 text-green hover:bg-light-green flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="hidden sm:block text-white/70 text-sm font-medium">
            {activeSection === 0 && 'Mentees'} 
            {activeSection === 1 && 'Mentors'} 
            {activeSection === 2 && 'Feedback'}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleNext}
            className="w-full sm:w-auto border-white/20 text-green hover:bg-light-green flex items-center justify-center"
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


const MenteesTable = ({ data, currentPage, onPageChange, exportToExcel, exportingTable, pageSize }) => {
  const totalPages = Math.ceil(data.total / pageSize);
  
  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-white">Mentees</CardTitle>
            <CardDescription className="text-white/70">
              All registered mentee applications ({data.total} total)
            </CardDescription>
          </div>
          <Button
            onClick={() => exportToExcel('mentees', data.data, 'mentees_export')}
            disabled={exportingTable === 'mentees'}
            className="bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{exportingTable === 'mentees' ? 'Exporting...' : 'Export to Excel'}</span>
            <span className="sm:hidden">{exportingTable === 'mentees' ? 'Exporting...' : 'Export'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="rounded-md border border-white/30 w-max min-w-full bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 bg-white/10 backdrop-blur-sm">
                  <TableHead className="text-white font-semibold min-w-[120px]">Name</TableHead>
                  <TableHead className="text-white font-semibold min-w-[180px]">Email</TableHead>
                  <TableHead className="text-white font-semibold min-w-[120px]">Field of Law</TableHead>
                  <TableHead className="text-white font-semibold min-w-[150px]">University</TableHead>
                  <TableHead className="text-white font-semibold min-w-[100px]">Hometown</TableHead>
                  <TableHead className="text-white font-semibold min-w-[140px]">Time Commitment</TableHead>
                  <TableHead className="text-white font-semibold min-w-[100px]">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.loading ? (
                   <TableRow>
                     <TableCell colSpan={7} className="text-center text-white/60 py-8">
                       <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                       <span className="ml-2">Loading...</span>
                     </TableCell>
                   </TableRow>
                 ) : data.data.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={7} className="text-center text-white/60 py-8">
                       No mentees found
                     </TableCell>
                   </TableRow>
                 ) : (
                   data.data.map((mentee) => (
                     <TableRow key={mentee.id} className="border-white/20 hover:bg-white/10 transition-colors duration-200">
                       <TableCell className="text-white font-medium">
                         {mentee.first_name} {mentee.last_name}
                       </TableCell>
                       <TableCell className="text-white/80 text-sm">{mentee.email}</TableCell>
                       <TableCell className="text-white/80 text-sm whitespace-normal break-words max-w-[180px]">{mentee.field_of_law}</TableCell>
                       <TableCell className="text-white/80 text-sm whitespace-normal break-words max-w-[180px]">{mentee.undergraduate_university}</TableCell>
                       <TableCell className="text-white/80 text-sm whitespace-normal break-words max-w-[180px]">{mentee.hometown}</TableCell>
                       <TableCell className="text-white/80 text-sm">{mentee.mentorship_time_commitment}</TableCell>
                       <TableCell className="text-white/80 text-sm">
                         {new Date(mentee.created_at).toLocaleDateString()}
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
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-white">Mentors</CardTitle>
            <CardDescription className="text-white/70">
              All registered mentor applications ({data.total} total)
            </CardDescription>
          </div>
          <Button
            onClick={() => exportToExcel('mentors', data.data, 'mentors_export')}
            disabled={exportingTable === 'mentors'}
            className="bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{exportingTable === 'mentors' ? 'Exporting...' : 'Export to Excel'}</span>
            <span className="sm:hidden">{exportingTable === 'mentors' ? 'Exporting...' : 'Export'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="rounded-md border border-white/30 w-min min-w-full bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 bg-white/10 backdrop-blur-sm">
                  <TableHead className="text-white font-semibold min-w-[120px]">Name</TableHead>
                  <TableHead className="text-white font-semibold min-w-[180px]">Email</TableHead>
                  <TableHead className="text-white font-semibold min-w-[120px]">Field of Law</TableHead>
                  <TableHead className="text-white font-semibold min-w-[80px]">Class Year</TableHead>
                  <TableHead className="text-white font-semibold min-w-[150px]">University</TableHead>
                  <TableHead className="text-white font-semibold min-w-[100px]">Hometown</TableHead>
                  <TableHead className="text-white font-semibold min-w-[140px]">Time Commitment</TableHead>
                  <TableHead className="text-white font-semibold min-w-[100px]">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.loading ? (
                   <TableRow>
                     <TableCell colSpan={8} className="text-center text-white/60 py-8">
                       <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                       <span className="ml-2">Loading...</span>
                     </TableCell>
                   </TableRow>
                 ) : data.data.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={8} className="text-center text-white/60 py-8">
                       No mentors found
                     </TableCell>
                   </TableRow>
                 ) : (
                   data.data.map((mentor) => (
                     <TableRow key={mentor.id} className="border-white/20 hover:bg-white/10 transition-colors duration-200">
                       <TableCell className="text-white font-medium">
                         {mentor.first_name} {mentor.last_name}
                       </TableCell>
                       <TableCell className="text-white/80 text-sm">{mentor.email}</TableCell>
                       <TableCell className="text-white/80 text-sm">{mentor.field_of_law}</TableCell>
                       <TableCell className="text-white/80 text-sm">{mentor.class_year}</TableCell>
                       <TableCell className="text-white/80 text-sm">{mentor.undergraduate_university}</TableCell>
                       <TableCell className="text-white/80 text-sm">{mentor.hometown}</TableCell>
                       <TableCell className="text-white/80 text-sm">{mentor.mentorship_time_commitment}</TableCell>
                       <TableCell className="text-white/80 text-sm">
                         {new Date(mentor.created_at).toLocaleDateString()}
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

const FeedbackTable = ({ data, currentPage, onPageChange, exportToExcel, exportingTable, pageSize }) => {
  const totalPages = Math.ceil(data.total / pageSize);
  
  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <CardTitle className="text-white">Feedback</CardTitle>
            <CardDescription className="text-white/70">
              User feedback submissions ({data.total} total)
            </CardDescription>
          </div>
          <Button
            onClick={() => exportToExcel('feedback', data.data, 'feedback_export')}
            disabled={exportingTable === 'feedback'}
            className="bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300 w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{exportingTable === 'feedback' ? 'Exporting...' : 'Export to Excel'}</span>
            <span className="sm:hidden">{exportingTable === 'feedback' ? 'Exporting...' : 'Export'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="rounded-md border border-white/30 w-max min-w-full bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 bg-white/10 backdrop-blur-sm">
                  <TableHead className="text-white font-semibold min-w-[180px]">Email</TableHead>
                  <TableHead className="text-white font-semibold min-w-[80px]">Rating</TableHead>
                  <TableHead className="text-white font-semibold min-w-[200px]">Suggestions</TableHead>
                  <TableHead className="text-white font-semibold min-w-[100px]">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.loading ? (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center text-white/60 py-8">
                       <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                       <span className="ml-2">Loading...</span>
                     </TableCell>
                   </TableRow>
                 ) : data.data.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center text-white/60 py-8">
                       No feedback found
                     </TableCell>
                   </TableRow>
                 ) : (
                   data.data.map((item) => (
                     <TableRow key={item.id} className="border-white/20 hover:bg-white/10 transition-colors duration-200">
                       <TableCell className="text-white/80 text-sm">{item.user_email}</TableCell>
                       <TableCell className="text-white/80 text-sm">{item.rating}/5</TableCell>
                       <TableCell className="text-white/80 text-sm whitespace-normal break-words max-w-[180px]">{item.suggestions}</TableCell>
                       <TableCell className="text-white/80 text-sm">
                         {new Date(item.created_at).toLocaleDateString()}
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
