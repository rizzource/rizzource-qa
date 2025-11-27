import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const applicationSchema = z.object({
  applicant_name: z.string().min(2, 'Name must be at least 2 characters'),
  applicant_email: z.string().email('Invalid email address'),
  applicant_phone: z.string().optional(),
  resume_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  cover_letter: z.string().min(50, 'Cover letter must be at least 50 characters'),
});

// Update the component props to include resumeUrl
const JobApplicationForm = ({ job, onCancel, resumeUrl }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('resume_url')
        .eq('id', user.id)
        .single();
      setUserProfile(data);
    };
    if (user) fetchUserProfile();
  }, [user]);

  // Update the form initialization with resumeUrl
  const form = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicant_name: '',
      applicant_email: user?.email || '',
      applicant_phone: '',
      resume_url: resumeUrl || '', // Set the enhanced CV URL here
      cover_letter: '',
    },
  });

  // Replace the existing useEffect for resume_url with this
  useEffect(() => {
    if (resumeUrl) {
      form.setValue('resume_url', resumeUrl);
    } else if (userProfile?.resume_url) {
      form.setValue('resume_url', userProfile.resume_url);
    }
  }, [resumeUrl, userProfile, form]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          company_id: job.company_id,
          applicant_id: user.id,
          ...data,
        });

      if (error) throw error;

      toast.success('Application submitted successfully!');
      navigate('/job-application-success');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="ghost" onClick={onCancel} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Details
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Apply for {job.title}</CardTitle>
              <p className="text-muted-foreground">{job.companies?.name}</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="applicant_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicant_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicant_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resume_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resume URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://drive.google.com/your-resume" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cover_letter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Letter *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us why you're a great fit for this position..." 
                            className="min-h-[200px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300">
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobApplicationForm;
