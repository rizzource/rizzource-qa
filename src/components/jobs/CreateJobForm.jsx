import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from 'sonner';

const jobSchema = z.object({
  company_id: z.string().min(1, 'Please select a company'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().optional(),
  job_type: z.string().optional(),
  salary_range: z.string().optional(),
  application_deadline: z.string().optional(),
});

const CreateJobForm = ({ companyId, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(jobSchema.omit({ company_id: true })),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      job_type: '',
      salary_range: '',
      application_deadline: '',
    },
  });

  const onSubmit = async (data) => {
    if (!companyId) {
      toast.error('No company selected');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          ...data,
          company_id: companyId,
          created_by: user.id,
          status: 'open',
        });

      if (error) throw error;

      toast.success('Job posted successfully!');
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!companyId) {
    return (
      <div className="text-center p-6 bg-muted rounded-lg">
        <p className="text-muted-foreground">Please select a company to post jobs.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title *</FormLabel>
              <FormControl>
                <Input placeholder="Senior Software Engineer" {...field} />
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
              <FormLabel>Job Description *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the role, responsibilities, and requirements..." 
                  className="min-h-[200px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco, CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="job_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <FormControl>
                  <Input placeholder="Full-time, Remote" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="salary_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range</FormLabel>
                <FormControl>
                  <Input placeholder="$100k - $150k" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="application_deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Deadline</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating...' : 'Post Job'}
        </Button>
      </form>
    </Form>
  );
};

export default CreateJobForm;
