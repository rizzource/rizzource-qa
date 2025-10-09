import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  owner_id: z.string().min(1, 'Please select an owner'),
});

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      description: '',
      website: '',
      owner_id: '',
    },
  });

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*, profiles!companies_owner_id_fkey(email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const onSubmit = async (data) => {
    setIsCreating(true);
    try {
      // Create company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert(data)
        .select()
        .single();

      if (companyError) throw companyError;

      // Add owner to user_roles if not already there
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.owner_id, role: 'owner' })
        .select();

      // Add owner to company_members
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: companyData.id,
          user_id: data.owner_id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      toast.success('Company created successfully!');
      form.reset();
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteCompany = async (companyId) => {
    if (!confirm('Are you sure you want to delete this company? This will also delete all associated jobs and applications.')) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;
      
      toast.success('Company deleted successfully');
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Company</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="About the company..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Owner *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
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

              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Company'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Existing Companies</h3>
        {loading ? (
          <p className="text-muted-foreground">Loading companies...</p>
        ) : companies.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No companies created yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {companies.map((company) => (
              <Card key={company.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold">{company.name}</h4>
                      {company.description && (
                        <p className="text-sm text-muted-foreground mt-1">{company.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Owner: {company.profiles?.email || 'N/A'}</span>
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => deleteCompany(company.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;
