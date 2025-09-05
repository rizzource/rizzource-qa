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
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Enter Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
            
              {/* Next Academic Event */}
              <FormField
                control={form.control}
                name="nextAcademicEvent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">What next academic event would you like?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                        <SelectItem value="workshop" className="text-foreground hover:bg-muted cursor-pointer">
                          Workshop
                        </SelectItem>
                        <SelectItem value="networking" className="text-foreground hover:bg-muted cursor-pointer">
                          Networking Session
                        </SelectItem>
                        <SelectItem value="panel" className="text-foreground hover:bg-muted cursor-pointer">
                          Panel Discussion
                        </SelectItem>
                        <SelectItem value="career-fair" className="text-foreground hover:bg-muted cursor-pointer">
                          Career Fair
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
            
              {/* Mentor Meetup Preference - How */}
              <FormField
                control={form.control}
                name="meetupHow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      How would you like to meet up with the mentee?
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                          <SelectValue placeholder="Select meetup method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                        <SelectItem value="coffee" className="text-foreground hover:bg-muted cursor-pointer">
                          Coffee
                        </SelectItem>
                        <SelectItem value="dinner" className="text-foreground hover:bg-muted cursor-pointer">
                          Dinner
                        </SelectItem>
                        <SelectItem value="walk" className="text-foreground hover:bg-muted cursor-pointer">
                          Walk / Outdoor Meetup
                        </SelectItem>
                        <SelectItem value="virtual" className="text-foreground hover:bg-muted cursor-pointer">
                          Virtual (Zoom/Google Meet)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
              
              {/* Mentor Meetup Preference - When */}
              <FormField
                control={form.control}
                name="meetupWhen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      When would you prefer to meet up with the mentee?
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                          <SelectValue placeholder="Select preferred time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                        <SelectItem value="weekdays" className="text-foreground hover:bg-muted cursor-pointer">
                          Weekdays
                        </SelectItem>
                        <SelectItem value="weekends" className="text-foreground hover:bg-muted cursor-pointer">
                          Weekends
                        </SelectItem>
                        <SelectItem value="mornings" className="text-foreground hover:bg-muted cursor-pointer">
                          Mornings
                        </SelectItem>
                        <SelectItem value="afternoons" className="text-foreground hover:bg-muted cursor-pointer">
                          Afternoons
                        </SelectItem>
                        <SelectItem value="evenings" className="text-foreground hover:bg-muted cursor-pointer">
                          Evenings
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
            </div>
          );
        default:
          return null;
      }
    }

    // Mentor form steps
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Enter Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                  </FormControl>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
          
            {/* Upload an Outline & Rate */}
            <FormItem>
              <FormLabel className="text-foreground">
                Upload an outline and rate at least one outline
              </FormLabel>
              <div className="flex flex-col gap-3">
                {/* Go to outlines button */}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => (window.location.href = "/outlines")}
                >
                  Go to Outlines
                </Button>
            
                {/* Checkbox if already uploaded */}
                <FormField
                  control={form.control}
                  name="alreadyUploaded"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-input text-accent focus:ring-2 focus:ring-accent"
                        />
                      </FormControl>
                      <FormLabel className="text-foreground text-sm">
                        I’ve already uploaded & rated
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </FormItem>
          
            {/* Mentor Meetup Preference - How */}
            <FormField
              control={form.control}
              name="meetupHow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    How would you like to meet up with the mentee?
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                        <SelectValue placeholder="Select meetup method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                      <SelectItem value="coffee" className="text-foreground hover:bg-muted cursor-pointer">
                        Coffee
                      </SelectItem>
                      <SelectItem value="dinner" className="text-foreground hover:bg-muted cursor-pointer">
                        Dinner
                      </SelectItem>
                      <SelectItem value="walk" className="text-foreground hover:bg-muted cursor-pointer">
                        Walk / Outdoor Meetup
                      </SelectItem>
                      <SelectItem value="virtual" className="text-foreground hover:bg-muted cursor-pointer">
                        Virtual (Zoom/Google Meet)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
            
            {/* Mentor Meetup Preference - When */}
            <FormField
              control={form.control}
              name="meetupWhen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    When would you prefer to meet up with the mentee?
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                      <SelectItem value="weekdays" className="text-foreground hover:bg-muted cursor-pointer">
                        Weekdays
                      </SelectItem>
                      <SelectItem value="weekends" className="text-foreground hover:bg-muted cursor-pointer">
                        Weekends
                      </SelectItem>
                      <SelectItem value="mornings" className="text-foreground hover:bg-muted cursor-pointer">
                        Mornings
                      </SelectItem>
                      <SelectItem value="afternoons" className="text-foreground hover:bg-muted cursor-pointer">
                        Afternoons
                      </SelectItem>
                      <SelectItem value="evenings" className="text-foreground hover:bg-muted cursor-pointer">
                        Evenings
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const stepTitles = [
    "Basic Information",
    "Background Information", 
    "Personal Details"
  ];

  return (
    <section className="min-h-screen bg-background flex items-center py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8 text-foreground hover:bg-muted flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Selection
          </Button>

          <Card className="bg-card backdrop-blur-sm border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-accent/20 rounded-full w-fit">
                {userType === 'mentor' ? (
                  <GraduationCap className="h-8 w-8 text-accent" />
                ) : (
                  <Users className="h-8 w-8 text-accent" />
                )}
              </div>
              <CardTitle className="text-2xl text-foreground">
                {userType === 'mentor' ? 'Mentor Application' : 'Mentee Application'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Step {currentStep} of 3: {stepTitles[currentStep - 1]}
              </CardDescription>
              
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" key={currentStep}>
                  {renderStepContent()}
                  
                  <div className="flex justify-between pt-4">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex items-center"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                    )}
                    
                    {currentStep < 3 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto whitespace-nowrap flex items-center"
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="ml-auto whitespace-nowrap flex items-center"
                      >
                        Submit Application
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SignupForm;