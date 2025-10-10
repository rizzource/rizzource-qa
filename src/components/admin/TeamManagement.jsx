import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';

const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['hr', 'admin', 'employee'], { required_error: 'Please select a role' }),
});

const TeamManagement = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: '',
    },
  });

  useEffect(() => {
    fetchOwnedCompanies();
  }, [user]);

  useEffect(() => {
    if (selectedCompany) {
      fetchTeamMembers();
    }
  }, [selectedCompany]);

  const fetchOwnedCompanies = async () => {
    try {
      // Get companies where the user is an owner through company_members
      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id, companies(id, name, description, website)')
        .eq('user_id', user.id)
        .eq('role', 'owner');

      if (memberError) throw memberError;

      const ownedCompanies = memberData.map(m => m.companies).filter(Boolean);
      setCompanies(ownedCompanies || []);
      if (ownedCompanies && ownedCompanies.length > 0) {
        setSelectedCompany(ownedCompanies[0].id);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    if (!selectedCompany) return;
    
    try {
      const { data, error } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', selectedCompany)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    }
  };

  const onSubmit = async (data) => {
    if (!selectedCompany) return;

    setIsAdding(true);
    try {
      // Use edge function to avoid session switching and bypass RLS safely
      const { data: result, error } = await supabase.functions.invoke('add-team-member', {
        body: {
          company_id: selectedCompany,
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        },
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Failed to add team member');

      toast.success('Team member added successfully!');
      form.reset();
      fetchTeamMembers();
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error(error.message || 'Failed to add team member');
    } finally {
      setIsAdding(false);
    }
  };

  const removeMember = async (memberId, userId, role) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      // Remove from company_members
      const { error: memberError } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);

      if (memberError) throw memberError;

      // Check if user is in other companies with the same role before removing role
      const { data: otherMemberships, error: checkError } = await supabase
        .from('company_members')
        .select('id, role')
        .eq('user_id', userId)
        .eq('role', role);

      if (checkError) throw checkError;

      // If no other memberships with this role, remove from user_roles
      if (!otherMemberships || otherMemberships.length === 0) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
      }

      toast.success('Team member removed');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">You don't own any companies yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Selection */}
      {companies.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Company</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Add Team Member Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Team Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter member name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add Team Member'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No team members yet. Add your first team member above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.name}
                      </TableCell>
                      <TableCell className="capitalize">{member.role}</TableCell>
                      <TableCell>
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.role !== 'owner' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMember(member.id, member.user_id, member.role)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;
