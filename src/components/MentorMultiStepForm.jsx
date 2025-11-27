import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, GraduationCap, Users, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { toast } from 'react-toastify';

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const meetupSchema = z.object({
  meetupHow: z.string().min(1, "Please select how you'd like to meet"),
  meetupWhen: z.string().min(1, "Please select when you'd like to meet"),
});

const outlinePreferenceSchema = z.object({
  outlinePreference: z.string().min(1, "Please select your outline preference"),
});

const MentorMultiStepForm = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailData, setEmailData] = useState({ email: "" });
  const [meetupData, setMeetupData] = useState({ meetupHow: "", meetupWhen: "" });
  const [outlinePreferenceData, setOutlinePreferenceData] = useState({ outlinePreference: "" });
  const navigate = useNavigate();

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const meetupForm = useForm({
    resolver: zodResolver(meetupSchema),
    defaultValues: { meetupHow: "", meetupWhen: "" },
  });

  const outlinePreferenceForm = useForm({
    resolver: zodResolver(outlinePreferenceSchema),
    defaultValues: { outlinePreference: "" },
  });

  const handleEmailSubmit = async (data) => {
    setLoading(true);
    try {
      // Check if mentor exists in database
      const { data: mentorData, error } = await supabase
        .from('mentors')
        .select('*')
        .eq('email', data.email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setEmailData(data);

      if (mentorData) {
        if (mentorData.had_uploaded_outline) {
          // Mentor has completed everything, go to matchup
          navigate("/matchup", { 
            state: { 
              mentorEmail: data.email,
              outlinePreference: mentorData.outline_preference || 'upload'
            } 
          });
          return;
        } else {
          // Mentor has form data but no outline, load data and continue
          setMeetupData({
            meetupHow: mentorData.meetup_how,
            meetupWhen: mentorData.meetup_when
          });
          if (mentorData.outline_preference) {
            setOutlinePreferenceData({ outlinePreference: mentorData.outline_preference });
            setCurrentStep(4); // Skip to final step if they already have preference
          } else {
            setCurrentStep(3); // Go to outline preference step
          }
          return;
        }
      }

      // New mentor, go to step 2
      setCurrentStep(2);
    } catch (error) {
      console.error("Error checking mentor data:", error);
      toast.error("Failed to check your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMeetupSubmit = async (data) => {
    setLoading(true);
    try {
      // Insert mentor data into database
      const { error } = await supabase.from('mentors').insert([{
        email: emailData.email,
        meetup_how: data.meetupHow,
        meetup_when: data.meetupWhen,
        had_uploaded_outline: false,
      }]);

      if (error) {
        throw error;
      }

      setMeetupData(data);
      setCurrentStep(3);
    } catch (error) {
      console.error("Error saving mentor data:", error);
      toast.error("Failed to save your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOutlinePreferenceSubmit = async (data) => {
    setLoading(true);
    try {
      // Update mentor data with outline preference
      const { error } = await supabase
        .from('mentors')
        .update({ outline_preference: data.outlinePreference })
        .eq('email', emailData.email);

      if (error) {
        throw error;
      }

      setOutlinePreferenceData(data);
      
      // Navigate to matchup with preference info
      navigate("/matchup", { 
        state: { 
          mentorEmail: emailData.email,
          outlinePreference: data.outlinePreference,
          mentorName: "Mentor",
          activity: meetupData.meetupHow || "coffee",
          meetupTime: meetupData.meetupWhen || "3pm, Tuesday 12th Sep, 2025"
        } 
      });
    } catch (error) {
      console.error("Error saving outline preference:", error);
      toast.error("Failed to save your preference. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadOutline = () => {
    // Store mentor data in session storage for outline upload
    const mentorFormData = {
      email: emailData.email,
      meetupHow: meetupData.meetupHow,
      meetupWhen: meetupData.meetupWhen,
      outlinePreference: outlinePreferenceData.outlinePreference
    };
    sessionStorage.setItem("mentorFormData", JSON.stringify(mentorFormData));
    navigate("/outlines?tab=upload");
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1:
        return <GraduationCap className="h-8 w-8 text-accent" />;
      case 2:
        return <Users className="h-8 w-8 text-accent" />;
      case 3:
        return <Users className="h-8 w-8 text-accent" />;
      case 4:
        return <Upload className="h-8 w-8 text-accent" />;
      default:
        return <GraduationCap className="h-8 w-8 text-accent" />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Mentor Application";
      case 2:
        return "Meetup Preferences";
      case 3:
        return "Outline Preferences";
      case 4:
        return "Upload Outline Required";
      default:
        return "Mentor Application";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Enter your email address to get started.";
      case 2:
        return "Tell us how and when you'd prefer to meet with mentees.";
      case 3:
        return "How would you like to contribute to the outlines community?";
      case 4:
        return "Upload your outline and rate at least one outline to complete your mentor registration.";
      default:
        return "Enter your email address to get started.";
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
                {getStepIcon()}
              </div>
              <CardTitle className="text-2xl text-foreground">
                {getStepTitle()}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {getStepDescription()}
              </CardDescription>
              
              {/* Step indicator */}
              <div className="flex justify-center mt-4 space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full ${
                      step <= currentStep 
                        ? "bg-accent" 
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </CardHeader>

            <CardContent>
              {currentStep === 1 && (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
                    <FormField
                      control={emailForm.control}
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
                    <div className="flex justify-end space-x-4">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "Checking..." : "Next"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {currentStep === 2 && (
                <Form {...meetupForm}>
                  <form onSubmit={meetupForm.handleSubmit(handleMeetupSubmit)} className="space-y-6">
                    <FormField
                      control={meetupForm.control}
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

                    <FormField
                      control={meetupForm.control}
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

                    <div className="flex space-x-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "Saving..." : "Next"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {currentStep === 3 && (
                <Form {...outlinePreferenceForm}>
                  <form onSubmit={outlinePreferenceForm.handleSubmit(handleOutlinePreferenceSubmit)} className="space-y-6">
                    <FormField
                      control={outlinePreferenceForm.control}
                      name="outlinePreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            How would you like to contribute to the outlines community?
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                                <SelectValue placeholder="Select your preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                              <SelectItem value="upload">Upload an outline</SelectItem>
                              <SelectItem value="rate">Rate an outline</SelectItem>
                              <SelectItem value="both">Do both</SelectItem>
                              <SelectItem value="none">I'll just sit back and nod wisely 😏</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-accent" />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentStep(2)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "Submitting..." : "Complete Registration"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <p className="text-muted-foreground">
                    To become a mentor, you need to upload an outline and rate at least one outline. This helps us match you with mentees
                    and demonstrates your expertise in your field of law.
                  </p>
                  <div className="flex justify-center pt-4 mt-auto">
                    <Button 
                      onClick={handleUploadOutline}
                      size="lg"
                      className="px-3 py-2"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Outline
                    </Button>
                  </div>
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