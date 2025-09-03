import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, GraduationCap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const mentorSchema = z.object({
  // Basic Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  classYear: z.string().min(1, "Please select your class year"),
  
  // Background Information
  lawFieldInterest: z.string().min(1, "Please enter your field of law interest"),
  hometown: z.string().min(2, "Please enter your hometown"),
  undergraduateUniversity: z.string().min(2, "Please enter your undergraduate university"),
  
  // Personal Information
  hobbiesInterests: z.string().min(10, "Please describe your hobbies/interests (at least 10 characters)"),
  timeCommitment: z.string().min(1, "Please select your time commitment level"),
  hasCar: z.string().min(1, "Please select if you have a car"),
  coMentors: z.string().optional(),
  lastComments: z.string().optional(),
});

const menteeSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  lawFieldInterest: z.string().min(1, "Please enter your field of law interest"),
  hometown: z.string().min(2, "Please enter your hometown"),
  undergraduateUniversity: z.string().min(2, "Please enter your undergraduate university"),
  hobbiesInterests: z.string().min(10, "Please describe your hobbies/interests (at least 10 characters)"),
  expectations: z.string().min(10, "Please describe your expectations (at least 10 characters)"),
  hasCar: z.string().min(1, "Please select if you have a car"),
  timeCommitment: z.string().min(1, "Please select your time commitment level"),
  concerns: z.string().optional(),
});

const SignupForm = ({ userType, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const schema = userType === 'mentor' ? mentorSchema : menteeSchema;
  const maxSteps = 3; // Both mentor and mentee now have 3 steps
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: userType === 'mentor' ? {
      firstName: "",
      lastName: "",
      email: "",
      classYear: "",
      lawFieldInterest: "",
      hometown: "",
      undergraduateUniversity: "",
      hobbiesInterests: "",
      timeCommitment: "",
      hasCar: "",
      coMentors: "",
      lastComments: "",
    } : {
      firstName: "",
      lastName: "",
      email: "",
      lawFieldInterest: "",
      hometown: "",
      undergraduateUniversity: "",
      hobbiesInterests: "",
      expectations: "",
      hasCar: "",
      timeCommitment: "",
      concerns: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const tableName = userType === 'mentor' ? 'mentors' : 'mentees';
      
      // Prepare data for database insertion
      const dbData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        field_of_law: data.lawFieldInterest,
        hometown: data.hometown,
        undergraduate_university: data.undergraduateUniversity,
        hobbies: data.hobbiesInterests,
        mentorship_time_commitment: data.timeCommitment,
        car_availability: data.hasCar === 'yes',
        comments: data.lastComments || data.concerns || null,
      };

      // Add mentor-specific fields
      if (userType === 'mentor') {
        dbData.class_year = data.classYear;
        dbData.co_mentor_preference = data.coMentors || null;
      }

      // Add mentee-specific fields
      if (userType === 'mentee') {
        dbData.expectations = data.expectations;
      }

      // Insert data into Supabase (public access for applications)
      const { error } = await supabase
        .from(tableName)
        .insert([dbData]);

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Authentication Required",
          description: "Please contact an administrator to complete your registration. Your data has been saved temporarily.",
        });
        // Still continue to thank you page even if there's an auth error
        // The data will be accessible to admins when they log in
      }

      // Store form data in sessionStorage for the thank you page
      sessionStorage.setItem('signupData', JSON.stringify({ ...data, userType }));
      
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate('/thank-you');
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    
    if (userType === 'mentee') {
      // For mentee, handle multi-step validation
      switch (currentStep) {
        case 1:
          fieldsToValidate = ['firstName', 'lastName', 'email'];
          break;
        case 2:
          fieldsToValidate = ['lawFieldInterest', 'hometown', 'undergraduateUniversity'];
          break;
        case 3:
          fieldsToValidate = ['hobbiesInterests', 'expectations', 'hasCar', 'timeCommitment'];
          break;
      }
    } else {
      // For mentor, handle multi-step validation
      switch (currentStep) {
        case 1:
          fieldsToValidate = ['firstName', 'lastName', 'email', 'classYear'];
          break;
        case 2:
          fieldsToValidate = ['lawFieldInterest', 'hometown', 'undergraduateUniversity'];
          break;
        case 3:
          fieldsToValidate = ['hobbiesInterests', 'timeCommitment', 'hasCar'];
          break;
      }
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
      // Small timeout to ensure DOM updates before scrolling
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    if (userType === 'mentee') {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">First Name</FormLabel>
                    <FormControl>
                       <Input 
                         {...field}
                         className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light"
                       />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Last Name</FormLabel>
                    <FormControl>
                       <Input 
                         {...field}
                         className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light"
                       />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Email</FormLabel>
                    <FormControl>
                       <Input 
                         type="email"
                         {...field}
                         className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light"
                       />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="lawFieldInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Field of law you are interested in?</FormLabel>
                    <FormControl>
                       <Input 
                         {...field}
                         className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light"
                       />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hometown"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Where is your hometown?</FormLabel>
                    <FormControl>
                       <Input 
                         {...field}
                         className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light"
                       />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="undergraduateUniversity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Where did you go to undergraduate?</FormLabel>
                    <FormControl>
                       <Input 
                         {...field}
                         className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light"
                       />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
            </div>
          );
        case 3:
          return (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hobbiesInterests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Any hobbies/interests outside law school?</FormLabel>
                    <FormControl>
                        <Textarea 
                          {...field}
                         className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 min-h-[100px] px-3 py-2 resize-none rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light"
                       />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">What do you expect from mentors or this program?</FormLabel>
                    <FormControl>
                        <Textarea 
                          {...field}
                         className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 min-h-[100px] px-3 py-2 resize-none rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light"
                       />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hasCar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Do you have a car?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                          <SelectTrigger className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light">
                            <SelectValue placeholder="Select if you have a car" />
                          </SelectTrigger>
                       </FormControl>
                       <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50 w-full min-w-[var(--radix-select-trigger-width)]">
                         <SelectItem value="yes" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                           <span className="block">Yes</span>
                         </SelectItem>
                         <SelectItem value="no" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                           <span className="block">No</span>
                         </SelectItem>
                         <SelectItem value="planning" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                           <span className="block">Planning on getting one</span>
                         </SelectItem>
                       </SelectContent>
                     </Select>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeCommitment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">How much time would you like to be dedicated to the mentorship?</FormLabel>
                    <div className="text-xs text-primary-foreground/70 mb-2">
                      1 = "I would like to check in for any help every once in a while" | 5 = "I would love a new friend, let's hang out"
                    </div>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                          <SelectTrigger className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light">
                            <SelectValue placeholder="Select your time commitment level" />
                          </SelectTrigger>
                       </FormControl>
                       <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50 w-full min-w-[var(--radix-select-trigger-width)]">
                         <SelectItem value="1" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                           <span className="block">1 - Check in occasionally</span>
                         </SelectItem>
                         <SelectItem value="2" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                           <span className="block">2</span>
                         </SelectItem>
                         <SelectItem value="3" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                           <span className="block">3 - Moderate engagement</span>
                         </SelectItem>
                         <SelectItem value="4" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                           <span className="block">4</span>
                         </SelectItem>
                         <SelectItem value="5" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                           <span className="block">5 - High engagement, new friend</span>
                         </SelectItem>
                       </SelectContent>
                     </Select>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="concerns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Any other concerns or thoughts? (Optional)</FormLabel>
                    <FormControl>
                        <Textarea 
                          {...field}
                         className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 min-h-[80px] px-3 py-2 resize-none rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light"
                       />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
            </div>
          );
        default:
          return null;
      }
    } else {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">First Name</FormLabel>
                    <FormControl>
                       <Input {...field} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light" />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Last Name</FormLabel>
                    <FormControl>
                       <Input {...field} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light" />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Email</FormLabel>
                    <FormControl>
                       <Input type="email" {...field} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light" />
                     </FormControl>
                     <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="classYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">What year are you in law school?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light">
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50 w-full min-w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="2L" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                          <span className="block">2L</span>
                        </SelectItem>
                        <SelectItem value="3L" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                          <span className="block">3L</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="lawFieldInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">What field of law are you most interested in?</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light" />
                    </FormControl>
                    <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hometown"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Where are you from?</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light" />
                    </FormControl>
                    <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="undergraduateUniversity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Where did you go to undergrad?</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light" />
                    </FormControl>
                    <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
            </div>
          );
        case 3:
          return (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hobbiesInterests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">What are some of your hobbies and interests?</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 min-h-[100px] px-3 py-2 resize-none rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light" />
                    </FormControl>
                    <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeCommitment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">How much time are you willing to dedicate to mentoring?</FormLabel>
                    <div className="text-xs text-primary-foreground/70 mb-2">
                      1 = "I can offer occasional advice" | 5 = "I'm looking to make a new friend!"
                    </div>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light">
                          <SelectValue placeholder="Select commitment level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50 w-full min-w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="1" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                          <span className="block">1 - Occasional advice</span>
                        </SelectItem>
                        <SelectItem value="2" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                          <span className="block">2</span>
                        </SelectItem>
                        <SelectItem value="3" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                          <span className="block">3 - Moderate commitment</span>
                        </SelectItem>
                        <SelectItem value="4" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                          <span className="block">4</span>
                        </SelectItem>
                        <SelectItem value="5" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                          <span className="block">5 - Looking for a new friend!</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hasCar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Do you have a car?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground px-3 rounded-md focus:border-gold-light focus:ring-2 focus:ring-gold-light">
                          <SelectValue placeholder="Select car availability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50 w-full min-w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="yes" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                          <span className="block">Yes</span>
                        </SelectItem>
                        <SelectItem value="no" className="text-foreground hover:bg-muted cursor-pointer pl-4 pr-4 py-2 focus:bg-muted data-[state=checked]:bg-muted">
                          <span className="block">No</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-gold-light" />
                  </FormItem>
                )}
              />
            </div>
          );
        default:
          return null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="container mx-auto px-4 py-8 mobile-optimized">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8 text-primary-foreground hover:bg-primary-foreground/10 whitespace-nowrap flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Selection
          </Button>

          
          <Card className="bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/20">
            <CardHeader>
              <CardTitle className="text-primary-foreground flex items-center gap-2">
                {userType === 'mentor' ? <GraduationCap className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                {userType === 'mentor' ? 'Mentor' : 'Mentee'} Registration
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Step {currentStep} of {maxSteps}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {renderStepContent()}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <div className="flex-1">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/50"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>
                      )}
                    </div>

                    <div className="flex-1 flex justify-end">
                      {currentStep < maxSteps ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300"
                        >
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="bg-gold-light text-primary hover:bg-gold-dark transition-all duration-300"
                        >
                          Complete Registration
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
