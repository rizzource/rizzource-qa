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
  const [mentees, setMentees] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingTable, setExportingTable] = useState("");
  const [activeSection, setActiveSection] = useState(0); // 0=mentees,1=mentors,2=feedback
  const navigate = useNavigate();
  const { toast } = useToast();

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
        supabase
          .from("mentees")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("mentors")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("feedback")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("data_exports").select("*", { count: "exact", head: true }),
      ]);

      setMentees(menteesResponse.data || []);
      setMentors(mentorsResponse.data || []);
      setFeedback(feedbackResponse.data || []);
      setStats({
        mentees: menteesResponse.data?.length || 0,
        mentors: mentorsResponse.data?.length || 0,
        feedback: feedbackResponse.data?.length || 0,
        exports: exportsResponse.count || 0,
      });
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
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      <Header />
      <div className="text-2xl font-semibold text-foreground mb-6">
        Welcome back, Admin!
      </div>
      <div className="container mx-auto px-4 py-8 space-y-8 flex-1">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentees</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.mentees}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered applications
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentors</CardTitle>
              <UserCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.mentors}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered applications
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.feedback}</div>
              <p className="text-xs text-muted-foreground mt-1">
                User submissions
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Exports</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.exports}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total exports performed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table Sections */}
        {activeSection === 0 && (
          <MenteesTable
            mentees={mentees}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
          />
        )}
        {activeSection === 1 && (
          <MentorsTable
            mentors={mentors}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
          />
        )}
        {activeSection === 2 && (
          <FeedbackTable
            feedback={feedback}
            exportToExcel={exportToExcel}
            exportingTable={exportingTable}
          />
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            className="border-white/20 text-green hover:bg-light-green whitespace-nowrap flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleNext}
            className="border-white/20 text-green hover:bg-light-green whitespace-nowrap flex items-center"
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


const MenteesTable = ({ mentees, exportToExcel, exportingTable }) => (
  <Card className="shadow-card bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-foreground">Mentees</CardTitle>
                <CardDescription className="text-muted-foreground">
                  All registered mentee applications
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToExcel('mentees', mentees, 'mentees_export')}
                disabled={exportingTable === 'mentees'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {exportingTable === 'mentees' ? 'Exporting...' : 'Export to Excel'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="rounded-md border border-border w-max min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-muted/50">
                      <TableHead className="text-foreground font-semibold min-w-[120px]">Name</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[180px]">Email</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[120px]">Field of Law</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[150px]">University</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[100px]">Hometown</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[140px]">Time Commitment</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[100px]">Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No mentees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      mentees.map((mentee) => (
                        <TableRow key={mentee.id} className="border-border hover:bg-muted/30">
                          <TableCell className="text-foreground font-medium">
                            {mentee.first_name} {mentee.last_name}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mentee.email}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mentee.field_of_law}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mentee.undergraduate_university}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mentee.hometown}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mentee.mentorship_time_commitment}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(mentee.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
);

const MentorsTable = ({ mentors, exportToExcel, exportingTable }) => (
  <Card className="shadow-card bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-foreground">Mentors</CardTitle>
                <CardDescription className="text-muted-foreground">
                  All registered mentor applications
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToExcel('mentors', mentors, 'mentors_export')}
                disabled={exportingTable === 'mentors'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {exportingTable === 'mentors' ? 'Exporting...' : 'Export to Excel'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="rounded-md border border-border w-min min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-muted/50">
                      <TableHead className="text-foreground font-semibold min-w-[120px]">Name</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[180px]">Email</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[120px]">Field of Law</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[80px]">Class Year</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[150px]">University</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[100px]">Hometown</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[140px]">Time Commitment</TableHead>
                      <TableHead className="text-foreground font-semibold min-w-[100px]">Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No mentors found
                        </TableCell>
                      </TableRow>
                    ) : (
                      mentors.map((mentor) => (
                        <TableRow key={mentor.id} className="border-border hover:bg-muted/30">
                          <TableCell className="text-foreground font-medium">
                            {mentor.first_name} {mentor.last_name}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mentor.email}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mentor.field_of_law}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mentor.class_year}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mentor.undergraduate_university}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mentor.hometown}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{mentor.mentorship_time_commitment}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(mentor.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
);

const FeedbackTable = ({ feedback, exportToExcel, exportingTable }) => (
  <Card className="shadow-card bg-white/95 backdrop-blur-sm">
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle className="text-foreground">Feedback</CardTitle>
          <CardDescription className="text-muted-foreground">
            User feedback submissions
          </CardDescription>
        </div>
        <Button
          onClick={() => exportToExcel('feedback', feedback, 'feedback_export')}
          disabled={exportingTable === 'feedback'}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {exportingTable === 'feedback' ? 'Exporting...' : 'Export to Excel'}
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <div className="rounded-md border border-border w-max min-w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/50">
                <TableHead className="text-foreground font-semibold min-w-[180px]">Email</TableHead>
                <TableHead className="text-foreground font-semibold min-w-[80px]">Rating</TableHead>
                <TableHead className="text-foreground font-semibold min-w-[200px]">Comments</TableHead>
                <TableHead className="text-foreground font-semibold min-w-[100px]">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No feedback found
                </TableCell>
              </TableRow>
  ) : (
    feedback.map((item) => (
      <TableRow key={item.id} className="border-border hover:bg-muted/30">
        <TableCell className="text-muted-foreground text-sm">{item.email}</TableCell>
        <TableCell className="text-muted-foreground text-sm">{item.rating}/5</TableCell>
        <TableCell className="max-w-xs truncate text-muted-foreground text-sm">{item.comments}</TableCell>
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
    </CardContent>
  </Card>
);
