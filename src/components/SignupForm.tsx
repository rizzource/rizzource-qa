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

const signupSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  
  // Professional Information
  currentPosition: z.string().min(2, "Please enter your current position"),
  organization: z.string().min(2, "Please enter your organization"),
  experienceLevel: z.string().min(1, "Please select your experience level"),
  
  // Program Information
  goals: z.string().min(10, "Please describe your goals (at least 10 characters)"),
  availability: z.string().min(1, "Please select your availability"),
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  userType: 'mentor' | 'mentee';
  onBack: () => void;
}

const SignupForm = ({ userType, onBack }: SignupFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      currentPosition: "",
      organization: "",
      experienceLevel: "",
      goals: "",
      availability: "",
    },
  });

  const onSubmit = (data: SignupFormData) => {
    // Store form data in sessionStorage for the thank you page
    sessionStorage.setItem('signupData', JSON.stringify({ ...data, userType }));
    navigate('/thank-you');
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof SignupFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['fullName', 'email', 'phone'];
        break;
      case 2:
        fieldsToValidate = ['currentPosition', 'organization', 'experienceLevel'];
        break;
      case 3:
        fieldsToValidate = ['goals', 'availability'];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      {...field} 
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
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
                  <FormLabel className="text-white">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Enter your email address" 
                      {...field} 
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your phone number" 
                      {...field} 
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </FormControl>
                  <FormMessage />
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
              name="currentPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Current Position</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Law Student, Associate, Partner" 
                      {...field}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Organization/Law School</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your organization or law school" 
                      {...field}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Experience Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">Law Student</SelectItem>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    {userType === 'mentor' ? 'What do you hope to contribute as a mentor?' : 'What are your career goals?'}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={userType === 'mentor' 
                        ? "Describe how you'd like to help mentees and what you can offer..."
                        : "Describe your career aspirations and what you hope to achieve..."
                      }
                      {...field}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Availability</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1-2-hours">1-2 hours per week</SelectItem>
                      <SelectItem value="3-4-hours">3-4 hours per week</SelectItem>
                      <SelectItem value="5-6-hours">5-6 hours per week</SelectItem>
                      <SelectItem value="flexible">Flexible schedule</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
    "Personal Information",
    "Professional Background", 
    "Program Details"
  ];

  return (
    <section className="min-h-screen bg-hero-gradient flex items-center py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Selection
          </Button>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-gold-light/20 rounded-full w-fit">
                {userType === 'mentor' ? (
                  <GraduationCap className="h-8 w-8 text-gold-light" />
                ) : (
                  <Users className="h-8 w-8 text-gold-light" />
                )}
              </div>
              <CardTitle className="text-2xl text-white">
                {userType === 'mentor' ? 'Mentor Application' : 'Mentee Application'}
              </CardTitle>
              <CardDescription className="text-white/80">
                Step {currentStep} of 3: {stepTitles[currentStep - 1]}
              </CardDescription>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                <div 
                  className="bg-gold-light h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {renderStepContent()}
                  
                  <div className="flex justify-between pt-4">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                    )}
                    
                    {currentStep < 3 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-gold-light text-primary hover:bg-gold-dark ml-auto"
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="bg-gold-light text-primary hover:bg-gold-dark ml-auto"
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