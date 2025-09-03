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
                    <FormLabel className="text-foreground">First Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email</FormLabel>
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
                    <FormLabel className="text-foreground">Field of law you are interested in?</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hometown"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Where is your hometown?</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="undergraduateUniversity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Where did you go to undergraduate?</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-accent" />
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
                    <FormLabel className="text-foreground">Any hobbies/interests outside law school?</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        className="bg-card border-input text-foreground placeholder:text-muted-foreground min-h-[100px] focus:border-accent focus:ring-2 focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">What do you expect from mentors or this program?</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        className="bg-card border-input text-foreground placeholder:text-muted-foreground min-h-[100px] focus:border-accent focus:ring-2 focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hasCar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Do you have a car?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                          <SelectValue placeholder="Select if you have a car" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                        <SelectItem value="yes" className="text-foreground hover:bg-muted cursor-pointer">
                          <span className="block">Yes</span>
                        </SelectItem>
                        <SelectItem value="no" className="text-foreground hover:bg-muted cursor-pointer">
                          <span className="block">No</span>
                        </SelectItem>
                        <SelectItem value="planning" className="text-foreground hover:bg-muted cursor-pointer">
                          <span className="block">Planning on getting one</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeCommitment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">How much time would you like to be dedicated to the mentorship?</FormLabel>
                    <div className="text-xs text-muted-foreground mb-2">
                      1 = "I would like to check in for any help every once in a while" | 5 = "I would love a new friend, let's hang out"
                    </div>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                          <SelectValue placeholder="Select your time commitment level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                        <SelectItem value="1" className="text-foreground hover:bg-muted cursor-pointer">
                          <span className="block">1 - Check in occasionally</span>
                        </SelectItem>
                        <SelectItem value="2" className="text-foreground hover:bg-muted cursor-pointer">
                          <span className="block">2</span>
                        </SelectItem>
                        <SelectItem value="3" className="text-foreground hover:bg-muted cursor-pointer">
                          <span className="block">3 - Moderate engagement</span>
                        </SelectItem>
                        <SelectItem value="4" className="text-foreground hover:bg-muted cursor-pointer">
                          <span className="block">4</span>
                        </SelectItem>
                        <SelectItem value="5" className="text-foreground hover:bg-muted cursor-pointer">
                          <span className="block">5 - High engagement, new friend</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="concerns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Any other concerns/comments? (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        className="bg-card border-input text-foreground placeholder:text-muted-foreground min-h-[80px] focus:border-accent focus:ring-2 focus:ring-accent"
                      />
                    </FormControl>
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
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">First Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                  </FormControl>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Last Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                  </FormControl>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
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
            <FormField
              control={form.control}
              name="classYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Class Year</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                        <SelectValue placeholder="Select your class year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                      <SelectItem value="2L" className="text-foreground hover:bg-muted cursor-pointer">
                        <span className="block">2L</span>
                      </SelectItem>
                      <SelectItem value="3L" className="text-foreground hover:bg-muted cursor-pointer">
                        <span className="block">3L</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-accent" />
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
                  <FormLabel className="text-foreground">What field of law are you interested in?</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                  </FormControl>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hometown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Where is your hometown?</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                  </FormControl>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="undergraduateUniversity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Where did you go to undergraduate university?</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                  </FormControl>
                  <FormMessage className="text-accent" />
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
                  <FormLabel className="text-foreground">What are your hobbies/interests outside of law school?</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      className="bg-card border-input text-foreground placeholder:text-muted-foreground min-h-[100px] focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                  </FormControl>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeCommitment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">How much time would you like to be dedicated to the mentorship?</FormLabel>
                  <div className="text-xs text-muted-foreground mb-2">
                    1 = "I would like to check in for help every once in a while" | 5 = "I would love a new friend, let's hang out!"
                  </div>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                        <SelectValue placeholder="Select your time commitment level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                      <SelectItem value="1" className="text-foreground hover:bg-muted cursor-pointer">
                        <span className="block">1 - Check in occasionally</span>
                      </SelectItem>
                      <SelectItem value="2" className="text-foreground hover:bg-muted cursor-pointer">
                        <span className="block">2</span>
                      </SelectItem>
                      <SelectItem value="3" className="text-foreground hover:bg-muted cursor-pointer">
                        <span className="block">3 - Moderate engagement</span>
                      </SelectItem>
                      <SelectItem value="4" className="text-foreground hover:bg-muted cursor-pointer">
                        <span className="block">4</span>
                      </SelectItem>
                      <SelectItem value="5" className="text-foreground hover:bg-muted cursor-pointer">
                        <span className="block">5 - High engagement, new friend</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hasCar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Do you have a car?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                        <SelectValue placeholder="Select if you have a car" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                      <SelectItem value="yes" className="text-foreground hover:bg-muted cursor-pointer">
                        <span className="block">Yes</span>
                      </SelectItem>
                      <SelectItem value="no" className="text-foreground hover:bg-muted cursor-pointer">
                        <span className="block">No</span>
                      </SelectItem>
                      <SelectItem value="planning" className="text-foreground hover:bg-muted cursor-pointer">
                        <span className="block">Planning on getting one</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coMentors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Is there someone you would like to be co-mentors with? (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      className="bg-card border-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                  </FormControl>
                  <FormMessage className="text-accent" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Any last comments? (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      className="bg-card border-input text-foreground placeholder:text-muted-foreground min-h-[80px] focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                  </FormControl>
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