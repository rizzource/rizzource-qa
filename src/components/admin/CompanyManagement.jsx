import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, Trash2, Users, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  owner_name: z.string().min(2, 'Owner name must be at least 2 characters'),
  owner_email: z.string().email('Please enter a valid email'),
  owner_password: z.string().min(6, 'Password must be at least 6 characters'),
});

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      description: '',
      website: '',
      owner_name: '',
      owner_email: '',
      owner_password: '',
    },
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsCreating(true);
    try {
      console.log('Creating company with data:', data);
      
      // Create owner account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.owner_email,
        password: data.owner_password,
      });

      if (authError) throw authError;
      
      if (!authData.user || !authData.user.id) {
        throw new Error('Failed to create owner account - no user ID returned');
      }

      console.log('Auth user created:', authData.user.id);

      // Validate that we have a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(authData.user.id)) {
        throw new Error('Invalid user ID format: ' + authData.user.id);
      }

      // Create company with owner information
      const companyInsertData = {
        name: data.name,
        description: data.description || null,
        website: data.website || null,
        owner_name: data.owner_name,
        owner_email: data.owner_email,
        owner_id: authData.user.id,
      };
      
      console.log('Inserting company data:', companyInsertData);
      
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert(companyInsertData)
        .select()
        .single();

      if (companyError) {
        console.error('Company creation error:', companyError);
        throw companyError;
      }

      // Add owner to user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: authData.user.id, role: 'owner' });

      if (roleError && !roleError.message.includes('duplicate')) {
        console.error('Role assignment error:', roleError);
        throw roleError;
      }

      // Add owner to company_members
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: companyData.id,
          user_id: authData.user.id,
          role: 'owner',
        });

      if (memberError) {
        console.error('Company member creation error:', memberError);
        throw memberError;
      }

      toast.success('Company and owner account created successfully!');
      form.reset();
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error(error.message || 'Failed to create company. Please try again.');
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

  const updateCompany = async (companyId, updateData) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: updateData.name,
          description: updateData.description || null,
          website: updateData.website || null,
        })
        .eq('id', companyId);

      if (error) throw error;
      
      toast.success('Company updated successfully');
      setIsEditDialogOpen(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
    }
  };

  const openEditDialog = (company) => {
    setEditingCompany(company);
    setIsEditDialogOpen(true);
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
                name="owner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="owner@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Password *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Minimum 6 characters" {...field} />
                    </FormControl>
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
                        <span>Owner Email: {company.owner_email || 'N/A'}</span>
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditDialog(company)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteCompany(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          {editingCompany && (
            <EditCompanyForm 
              company={editingCompany} 
              onSubmit={updateCompany}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EditCompanyForm = ({ company, onSubmit, onCancel }) => {
  const editSchema = z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    description: z.string().optional(),
    website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  });

  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: company.name || '',
      description: company.description || '',
      website: company.website || '',
    },
  });

  const handleSubmit = (data) => {
    onSubmit(company.id, data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanyManagement;
