import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserCheck, MessageSquare, Activity, Shield, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export const AdminDashboard = () => {
  const { user, userProfile, isAdmin, signOut } = useAuth();
  const [stats, setStats] = useState({
    mentees: 0,
    mentors: 0,
    feedback: 0,
    exports: 0
  });
  const [mentees, setMentees] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingTable, setExportingTable] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    if (userProfile && !isAdmin()) {
      navigate('/');
      return;
    }
    
    fetchStats();
  }, [user, userProfile, navigate, isAdmin]);

  const fetchStats = async () => {
    if (!isAdmin()) return;
    
    try {
      const [menteesResponse, mentorsResponse, feedbackResponse, exportsResponse] = await Promise.all([
        supabase.from('mentees').select('*').order('created_at', { ascending: false }),
        supabase.from('mentors').select('*').order('created_at', { ascending: false }),
        supabase.from('feedback').select('*').order('created_at', { ascending: false }),
        supabase.from('data_exports').select('*', { count: 'exact', head: true })
      ]);

      setMentees(menteesResponse.data || []);
      setMentors(mentorsResponse.data || []);
      setFeedback(feedbackResponse.data || []);
      
      setStats({
        mentees: menteesResponse.data?.length || 0,
        mentors: mentorsResponse.data?.length || 0,
        feedback: feedbackResponse.data?.length || 0,
        exports: exportsResponse.count || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, tableName);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fullFilename = `${filename}_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, fullFilename);

      // Log the export in the database
      await supabase.rpc('export_data_to_json', { table_name: tableName });

      toast({
        title: "Export Successful",
        description: `${data.length} records exported to ${fullFilename}`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExportingTable('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
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
            <Button onClick={() => navigate('/')} className="w-full bg-primary hover:bg-primary/90">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {userProfile?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Administrator
              </Badge>
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                className="border-border hover:bg-muted"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card">
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
          
          <Card className="shadow-card">
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
          
          <Card className="shadow-card">
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
          
          <Card className="shadow-card">
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

        {/* Mentees Table */}
        <Card className="shadow-card">
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
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Name</TableHead>
                    <TableHead className="text-foreground font-semibold">Email</TableHead>
                    <TableHead className="text-foreground font-semibold">Field of Law</TableHead>
                    <TableHead className="text-foreground font-semibold">University</TableHead>
                    <TableHead className="text-foreground font-semibold">Hometown</TableHead>
                    <TableHead className="text-foreground font-semibold">Time Commitment</TableHead>
                    <TableHead className="text-foreground font-semibold">Created At</TableHead>
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
                        <TableCell className="text-muted-foreground">{mentee.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {mentee.field_of_law}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{mentee.undergraduate_university}</TableCell>
                        <TableCell className="text-muted-foreground">{mentee.hometown}</TableCell>
                        <TableCell className="text-muted-foreground">{mentee.mentorship_time_commitment}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(mentee.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mentors Table */}
        <Card className="shadow-card">
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
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Name</TableHead>
                    <TableHead className="text-foreground font-semibold">Email</TableHead>
                    <TableHead className="text-foreground font-semibold">Field of Law</TableHead>
                    <TableHead className="text-foreground font-semibold">Class Year</TableHead>
                    <TableHead className="text-foreground font-semibold">University</TableHead>
                    <TableHead className="text-foreground font-semibold">Hometown</TableHead>
                    <TableHead className="text-foreground font-semibold">Time Commitment</TableHead>
                    <TableHead className="text-foreground font-semibold">Created At</TableHead>
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
                        <TableCell className="text-muted-foreground">{mentor.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {mentor.field_of_law}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{mentor.class_year}</TableCell>
                        <TableCell className="text-muted-foreground">{mentor.undergraduate_university}</TableCell>
                        <TableCell className="text-muted-foreground">{mentor.hometown}</TableCell>
                        <TableCell className="text-muted-foreground">{mentor.mentorship_time_commitment}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(mentor.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Table */}
        <Card className="shadow-card">
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
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/50">
                    <TableHead className="text-foreground font-semibold">Email</TableHead>
                    <TableHead className="text-foreground font-semibold">Rating</TableHead>
                    <TableHead className="text-foreground font-semibold">Suggestions</TableHead>
                    <TableHead className="text-foreground font-semibold">Created At</TableHead>
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
                        <TableCell className="text-muted-foreground">{item.user_email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.rating === 'Excellent' ? 'default' : 
                                   item.rating === 'Good' ? 'secondary' : 'outline'}
                            className={item.rating === 'Excellent' ? 'bg-primary text-primary-foreground' : ''}
                          >
                            {item.rating}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {item.suggestions || 'No suggestions provided'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};