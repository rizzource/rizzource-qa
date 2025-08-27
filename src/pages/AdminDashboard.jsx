import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserCheck, MessageSquare, Download, Shield, Activity, FileSpreadsheet } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this area.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/70">
              Welcome back, {userProfile?.email}
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="text-white border-white/20 hover:bg-white/10">
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mentees}</div>
              <p className="text-xs text-muted-foreground">
                Registered mentee applications
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mentors}</div>
              <p className="text-xs text-muted-foreground">
                Registered mentor applications
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.feedback}</div>
              <p className="text-xs text-muted-foreground">
                User feedback submissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Exports</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.exports}</div>
              <p className="text-xs text-muted-foreground">
                Total exports performed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mentees Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">Mentees</CardTitle>
                <CardDescription className="text-white/70">
                  All registered mentee applications
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToExcel('mentees', mentees, 'mentees_export')}
                disabled={exportingTable === 'mentees'}
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {exportingTable === 'mentees' ? 'Exporting...' : 'Export to Excel'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/20">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white/90">Name</TableHead>
                    <TableHead className="text-white/90">Email</TableHead>
                    <TableHead className="text-white/90">Field of Law</TableHead>
                    <TableHead className="text-white/90">University</TableHead>
                    <TableHead className="text-white/90">Hometown</TableHead>
                    <TableHead className="text-white/90">Time Commitment</TableHead>
                    <TableHead className="text-white/90">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-white/70 py-8">
                        No mentees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    mentees.map((mentee) => (
                      <TableRow key={mentee.id} className="border-white/20">
                        <TableCell className="text-white">
                          {mentee.first_name} {mentee.last_name}
                        </TableCell>
                        <TableCell className="text-white/80">{mentee.email}</TableCell>
                        <TableCell className="text-white/80">
                          <Badge variant="secondary">{mentee.field_of_law}</Badge>
                        </TableCell>
                        <TableCell className="text-white/80">{mentee.undergraduate_university}</TableCell>
                        <TableCell className="text-white/80">{mentee.hometown}</TableCell>
                        <TableCell className="text-white/80">{mentee.mentorship_time_commitment}</TableCell>
                        <TableCell className="text-white/80">
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
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">Mentors</CardTitle>
                <CardDescription className="text-white/70">
                  All registered mentor applications
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToExcel('mentors', mentors, 'mentors_export')}
                disabled={exportingTable === 'mentors'}
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {exportingTable === 'mentors' ? 'Exporting...' : 'Export to Excel'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/20">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white/90">Name</TableHead>
                    <TableHead className="text-white/90">Email</TableHead>
                    <TableHead className="text-white/90">Field of Law</TableHead>
                    <TableHead className="text-white/90">Class Year</TableHead>
                    <TableHead className="text-white/90">University</TableHead>
                    <TableHead className="text-white/90">Hometown</TableHead>
                    <TableHead className="text-white/90">Time Commitment</TableHead>
                    <TableHead className="text-white/90">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-white/70 py-8">
                        No mentors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    mentors.map((mentor) => (
                      <TableRow key={mentor.id} className="border-white/20">
                        <TableCell className="text-white">
                          {mentor.first_name} {mentor.last_name}
                        </TableCell>
                        <TableCell className="text-white/80">{mentor.email}</TableCell>
                        <TableCell className="text-white/80">
                          <Badge variant="secondary">{mentor.field_of_law}</Badge>
                        </TableCell>
                        <TableCell className="text-white/80">{mentor.class_year}</TableCell>
                        <TableCell className="text-white/80">{mentor.undergraduate_university}</TableCell>
                        <TableCell className="text-white/80">{mentor.hometown}</TableCell>
                        <TableCell className="text-white/80">{mentor.mentorship_time_commitment}</TableCell>
                        <TableCell className="text-white/80">
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
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">Feedback</CardTitle>
                <CardDescription className="text-white/70">
                  User feedback submissions
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToExcel('feedback', feedback, 'feedback_export')}
                disabled={exportingTable === 'feedback'}
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {exportingTable === 'feedback' ? 'Exporting...' : 'Export to Excel'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/20">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white/90">Email</TableHead>
                    <TableHead className="text-white/90">Rating</TableHead>
                    <TableHead className="text-white/90">Suggestions</TableHead>
                    <TableHead className="text-white/90">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-white/70 py-8">
                        No feedback found
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedback.map((item) => (
                      <TableRow key={item.id} className="border-white/20">
                        <TableCell className="text-white/80">{item.user_email}</TableCell>
                        <TableCell className="text-white/80">
                          <Badge variant={item.rating === 'Excellent' ? 'default' : 
                                        item.rating === 'Good' ? 'secondary' : 'outline'}>
                            {item.rating}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/80 max-w-xs truncate">
                          {item.suggestions || 'No suggestions provided'}
                        </TableCell>
                        <TableCell className="text-white/80">
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