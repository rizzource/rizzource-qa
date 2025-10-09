import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';

const teamMemberSchema = z.object({
  user_id: z.string().min(1, 'Please select a user'),
  role: z.enum(['hr', 'admin'], { required_error: 'Please select a role' }),
});

const TeamManagement = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      user_id: '',
      role: '',
    },
  });

  useEffect(() => {
    fetchOwnedCompanies();
  }, [user]);

  useEffect(() => {
    if (selectedCompany) {
      fetchTeamMembers();
      fetchAvailableUsers();
    }
  }, [selectedCompany]);

  const fetchOwnedCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id);

      if (error) throw error;
      setCompanies(data || []);
      if (data && data.length > 0) {
        setSelectedCompany(data[0].id);
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
        .select('*, profiles(email)')
        .eq('company_id', selectedCompany)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    }
  };

  const fetchAvailableUsers = async () => {
    if (!selectedCompany) return;

    try {
      // Get all users
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email');

      if (usersError) throw usersError;

      // Get existing team members
      const { data: existingMembers, error: membersError } = await supabase
        .from('company_members')
        .select('user_id')
        .eq('company_id', selectedCompany);

      if (membersError) throw membersError;

      // Filter out existing members
      const existingIds = new Set(existingMembers.map(m => m.user_id));
      const available = allUsers.filter(u => !existingIds.has(u.id));
      
      setAvailableUsers(available || []);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedCompany) return;
    
    setIsAdding(true);
    try {
      // Add to company_members
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: selectedCompany,
          user_id: data.user_id,
          role: data.role,
        });

      if (memberError) throw memberError;

      // Add to user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user_id,
          role: data.role,
        });

      // Ignore duplicate role errors
      if (roleError && !roleError.message.includes('duplicate')) {
        throw roleError;
      }

      toast.success('Team member added successfully!');
      form.reset();
      fetchTeamMembers();
      fetchAvailableUsers();
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member');
    } finally {
      setIsAdding(false);
    }
  };

  const removeMember = async (memberId, userId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      // Remove from company_members
      const { error: memberError } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);

      if (memberError) throw memberError;

      // Check if user is in other companies before removing role
      const { data: otherMemberships, error: checkError } = await supabase
        .from('company_members')
        .select('id')
        .eq('user_id', userId);

      if (checkError) throw checkError;

      // If no other memberships, remove from user_roles
      if (!otherMemberships || otherMemberships.length === 0) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
      }

      toast.success('Team member removed');
      fetchTeamMembers();
      fetchAvailableUsers();
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
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.profiles?.email}
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
                            onClick={() => removeMember(member.id, member.user_id)}
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
