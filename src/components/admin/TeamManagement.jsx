import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Trash2, UserPlus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['hr', 'admin', 'employee'], { required_error: 'Please select a role' }),
});

const TeamManagement = ({ companyId }) => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    if (companyId) {
      fetchTeamMembers();
    }
  }, [companyId]);

  const fetchTeamMembers = async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!companyId) {
      toast.error('No company selected');
      return;
    }

    setIsAdding(true);
    try {
      // Use edge function to avoid session switching and bypass RLS safely
      const { data: result, error } = await supabase.functions.invoke('add-team-member', {
        body: {
          company_id: companyId,
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

  const updateMember = async (memberId, updateData) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('update-team-member', {
        body: {
          company_id: companyId,
          member_id: memberId,
          name: updateData.name,
          role: updateData.role,
          old_role: updateData.oldRole,
        },
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Failed to update team member');

      toast.success('Team member updated successfully');
      setIsEditDialogOpen(false);
      setEditingMember(null);
      await fetchTeamMembers();
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error(error.message || 'Failed to update team member');
    }
  };

  const openEditDialog = (member) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!companyId) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Please select a company to manage team.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
                        {member.name}
                      </TableCell>
                      <TableCell>
                        {member.email}
                      </TableCell>
                      <TableCell className="capitalize">{member.role}</TableCell>
                      <TableCell>
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.role !== 'owner' && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeMember(member.id, member.user_id, member.role)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <EditMemberForm 
              member={editingMember} 
              onSubmit={updateMember}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EditMemberForm = ({ member, onSubmit, onCancel }) => {
  const editSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['hr', 'admin', 'employee'], { required_error: 'Please select a role' }),
  });

  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: member.name || '',
      role: member.role || '',
    },
  });

  useEffect(() => {
    form.reset({ name: member.name || '', role: member.role || '' });
  }, [member, form]);

  const handleSubmit = (data) => {
    onSubmit(member.id, { ...data, oldRole: member.role });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TeamManagement;
