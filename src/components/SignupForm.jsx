import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, GraduationCap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Mentor schema
const mentorSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  alreadyUploaded: z.boolean().optional(),
  meetupHow: z.string().min(1, "Please select how you’d like to meet"),
  meetupWhen: z.string().min(1, "Please select when you’d like to meet"),
});

// Mentee schema
const menteeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  nextAcademicEvent: z.string().min(1, "Please select an academic event"),
  meetupHow: z.string().min(1, "Please select how you’d like to meet"),
  meetupWhen: z.string().min(1, "Please select when you’d like to meet"),
});

const SignupForm = ({ userType, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const schema = userType === "mentor" ? mentorSchema : menteeSchema;

  const handleOutlinesClick = () => {
    navigate('/outlines');
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      userType === "mentor"
        ? { email: "", alreadyUploaded: false, meetupHow: "", meetupWhen: "" }
        : { email: "", nextAcademicEvent: "", meetupHow: "", meetupWhen: "" },
  });

  const onSubmit = async (data) => {
    try {
      const tableName = userType === "mentor" ? "mentors" : "mentees";
      const dbData = {
        email: data.email,
        meetup_how: data.meetupHow,
        meetup_when: data.meetupWhen,
      };

      if (userType === "mentor") {
        dbData.already_uploaded = data.alreadyUploaded || false;
      } else {
        dbData.next_academic_event = data.nextAcademicEvent;
      }

      const { error } = await supabase.from(tableName).insert([dbData]);

      if (error) {
        console.error("Supabase error:", error);
        toast({
          title: "Authentication Required",
          description:
            "Please contact an administrator to complete your registration. Your data has been saved temporarily.",
        });
      }

      sessionStorage.setItem("signupData", JSON.stringify({ ...data, userType }));
      navigate("/thank-you");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
                {userType === "mentor" ? (
                  <GraduationCap className="h-8 w-8 text-accent" />
                ) : (
                  <Users className="h-8 w-8 text-accent" />
                )}
              </div>
              <CardTitle className="text-2xl text-foreground">
                {userType === "mentor" ? "Mentor Application" : "Mentee Application"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Please complete the form below.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                  {/* Mentor-specific */}
                  {userType === "mentor" && (
                    <>
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Upload an outline and rate at least one outline
                        </FormLabel>
                        <div className="flex flex-col gap-3">
                          <Button 
                            size="sm" 
                            className="ml-auto whitespace-nowrap flex items-center border-accent hover:bg-accent/10"
                            onClick={(e) => { e.stopPropagation(); handleOutlinesClick(); }}
                          >
                            Go to Outlines
                          </Button>

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
                    </>
                  )}

                  {/* Mentee-specific */}
                  {userType === "mentee" && (
                    <FormField
                      control={form.control}
                      name="nextAcademicEvent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            What next academic event would you like?
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-card border-input text-foreground focus:border-accent focus:ring-2 focus:ring-accent">
                                <SelectValue placeholder="Select an event" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border border-border rounded-md shadow-lg z-50">
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="networking">Networking Session</SelectItem>
                              <SelectItem value="panel">Panel Discussion</SelectItem>
                              <SelectItem value="career-fair">Career Fair</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-accent" />
                        </FormItem>
                      )}
                    />
                  )}

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

                  {/* Submit Button */}
                  <Button type="submit" className="ml-auto whitespace-nowrap flex items-center">
                    Submit Application
                  </Button>
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
