import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, GraduationCap, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const mentorFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  meetupHow: z.string().min(1, "Please select how you'd like to meet"),
  meetupWhen: z.string().min(1, "Please select when you'd like to meet"),
});

const MentorMultiStepForm = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(mentorFormSchema),
    defaultValues: {
      email: "",
      meetupHow: "",
      meetupWhen: "",
    },
  });

  const handleNextStep = async (data) => {
    if (currentStep === 1) {
      setLoading(true);
      try {
        // Check if mentor has already uploaded outline
        const { data: mentorData, error } = await supabase
          .from('mentors')
          .select('had_uploaded_outline')
          .eq('email', data.email)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // Save form data to session storage
        sessionStorage.setItem("mentorFormData", JSON.stringify(data));

        if (mentorData && mentorData.had_uploaded_outline) {
          // Redirect to matchup screen
          navigate("/matchup", { state: { mentorEmail: data.email } });
        } else {
          // Go to upload outline step
          setCurrentStep(2);
        }
      } catch (error) {
        console.error("Error checking mentor data:", error);
        toast({
          title: "Error",
          description: "Failed to check your information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUploadOutline = () => {
    // Store current form data before navigating
    const currentFormData = form.getValues();
    sessionStorage.setItem("mentorFormData", JSON.stringify(currentFormData));
    navigate("/outlines?tab=upload");
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const { error } = await supabase.from('mentors').insert([{
        email: data.email,
        meetup_how: data.meetupHow,
        meetup_when: data.meetupWhen,
        had_uploaded_outline: false,
      }]);

      if (error) {
        throw error;
      }

      sessionStorage.setItem("mentorFormData", JSON.stringify(data));
      toast({
        title: "Success",
        description: "Your mentor application has been submitted.",
      });

      navigate("/thank-you");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                {currentStep === 1 ? (
                  <GraduationCap className="h-8 w-8 text-accent" />
                ) : (
                  <Upload className="h-8 w-8 text-accent" />
                )}
              </div>
              <CardTitle className="text-2xl text-foreground">
                {currentStep === 1 ? "Mentor Application" : "Upload Outline Required"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {currentStep === 1 
                  ? "Please complete your information below." 
                  : "Upload your outline to complete your mentor registration."
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {currentStep === 1 ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleNextStep)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} className="bg-card border-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Meetup How */}
                  <FormField
                    control={form.control}
                    name="meetupHow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          How would you like to meet up?
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                              <SelectValue placeholder="Select meetup method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                            <SelectItem value="coffee">Coffee</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="walk">Walk / Outdoor Meetup</SelectItem>
                            <SelectItem value="virtual">Virtual (Zoom/Google Meet)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-accent" />
                      </FormItem>
                    )}
                  />

                  {/* Meetup When */}
                  <FormField
                    control={form.control}
                    name="meetupWhen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          When would you prefer to meet up?
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                              <SelectValue placeholder="Select preferred time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                            <SelectItem value="weekdays">Weekdays</SelectItem>
                            <SelectItem value="weekends">Weekends</SelectItem>
                            <SelectItem value="mornings">Mornings</SelectItem>
                            <SelectItem value="afternoons">Afternoons</SelectItem>
                            <SelectItem value="evenings">Evenings</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-accent" />
                      </FormItem>
                    )}
                  />

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Checking..." : "Next"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="text-center space-y-6">
                  <p className="text-muted-foreground">
                    To become a mentor, you need to upload an outline and rate at least one outline. This helps us match you with mentees
                    and demonstrates your expertise in your field of law.
                  </p>
                  <Button 
                    onClick={handleUploadOutline}
                    size="lg"
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Outline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MentorMultiStepForm;